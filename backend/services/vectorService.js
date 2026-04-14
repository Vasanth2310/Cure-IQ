const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let pc, index;
let genAI;

const initClients = async () => {
    try {
        if (!process.env.PINECONE_API_KEY || !process.env.GEMINI_API_KEY) {
            console.warn("Missing Pinecone or Gemini API Keys. RAG pipeline will fail.");
            return;
        }

        pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        const indexName = 'cureiq';
        
        // Wait, standard Pinecone client SDK checking:
        const existingIndexes = await pc.listIndexes();
        const indexExists = existingIndexes.indexes?.some(i => i.name === indexName);

        if (!indexExists) {
            console.log(`Creating Pinecone index: ${indexName}...`);
            await pc.createIndex({
                name: indexName,
                dimension: 768, // Gemini text-embedding-004 is 768 dimensions
                metric: 'cosine',
                spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }
            });
            console.log("Index created. Waiting to initialize...");
            // Optionally wait for index to be ready if needed
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }

        index = pc.Index(indexName);
        console.log("Pinecone index wired up.");
    } catch (error) {
        console.error("Vector DB Init Error:", error);
    }
};

const getEmbedding = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
        const result = await model.embedContent(text);
        // Gemini returns the embedding array directly depending on SDK
        const embedding = result.embedding.values;
        return embedding;
    } catch (e) {
        console.error("Embedding error:", e);
        throw e;
    }
};

const upsertDocument = async (patientId, documentName, chunks) => {
    if (!index) return;
    
    // Chunk logic: embed every chunk and batch upload to pinecone
    const vectors = [];
    
    for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        if(!chunkText.trim()) continue;

        const embedding = await getEmbedding(chunkText);
        
        vectors.push({
            id: `${patientId}_${documentName}_chunk_${i}`,
            values: embedding,
            metadata: {
                patientId: patientId.toString(),
                documentName,
                text: chunkText
            }
        });
    }

    // Upsert to Pinecone
    if (vectors.length > 0) {
        await index.upsert({ records: vectors });
        console.log(`Upserted ${vectors.length} chunks for ${documentName}`);
    }
};

const queryContext = async (patientId, queryText, topK = 3) => {
    if (!index) return "";

    const queryEmbedding = await getEmbedding(queryText);
    
    const queryResponse = await index.query({
        vector: queryEmbedding,
        topK,
        includeMetadata: true,
        filter: {
            patientId: { $eq: patientId.toString() }
        }
    });

    if (queryResponse.matches.length === 0) return "";

    return queryResponse.matches.map(match => match.metadata.text).join('\n---\n');
};

const getLLMResponse = async (prompt, context) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const finalPrompt = `
You are CureIQ, a highly intelligent medical assistant designed to help patients understand their health based heavily on their uploaded real-world medical documents.

Here is the context specifically retrieved from the patient's own medical records:
<document_context>
${context}
</document_context>

Patient Query: ${prompt}

If the context contains relevant information (like specific test results, values, or diagnoses), you MUST explicitly cite and use that information in your answer. 
If the context does not contain the answer, provide general medical guidance and state that their uploaded records don't mention this explicitly. Always maintain a professional, empathetic, and medically sound tone, and always advise them to consult their doctor for clinical decisions.
    `;

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    return response.text();
}

// Call init manually or when needed
initClients();

module.exports = {
    upsertDocument,
    queryContext,
    getLLMResponse
};
