const fs = require('fs');
const pdf = require('pdf-parse');
const vectorService = require('../services/vectorService');

// Basic text chunking helper
const chunkText = (text, maxLength = 800) => {
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        chunks.push(text.slice(i, i + maxLength));
        i += maxLength;
    }
    return chunks;
};

exports.askQuestion = async (req, res) => {
    const { question } = req.body;
    
    console.log(`[RAG User ${req.user.id}] Asking: ${question}`);

    try {
        // 1. Retrieve most relevant context chunks from Pinecone vectors
        const retrievedContext = await vectorService.queryContext(req.user.id, question);
        
        console.log(`Retrieved Context Snippet: ${retrievedContext ? "Found matches." : "No relevant matches found."}`);

        // 2. Generate final response using Gemini Pro grounded in retrieved context
        const llmResponse = await vectorService.getLLMResponse(question, retrievedContext);

        res.status(200).json({ answer: llmResponse, confidence: retrievedContext ? 0.95 : 0.60 });
    } catch (e) {
        console.error("RAG Pipeline Error:", e);
        res.status(500).json({ message: 'RAG Pipeline error while processing prompt.' });
    }
}

exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        console.log(`Processing file uploaded by user ${req.user.id}:`, req.file.filename);
        const filePath = req.file.path;
        
        // Ensure its a PDF for standard extraction
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            
            // Clean and Chunk raw text
            const rawText = data.text;
            const chunks = chunkText(rawText);

            console.log(`Extracted ${chunks.length} chunks. Uploading to Pinecone...`);
            
            // Upsert Vectors to Pinecone Async
            await vectorService.upsertDocument(req.user.id, req.file.originalname, chunks);
            
            res.status(200).json({ 
                message: 'Document uploaded, scanned, and embedded to your knowledge base successfully.',
                fileId: req.file.filename,
                originalName: req.file.originalname
            });
        } else {
            // For images (e.g. X-rays) you might pass to Gemini Vision API instead of pdf-parse
            // Simplification: respond nicely for now.
            res.status(400).json({ message: 'Currently, only PDF parsing is implemented for embedding.' });
        }
    } catch (e) {
        console.error("File processing error:", e);
        res.status(500).json({ message: 'Error processing document text and embeddings.' });
    }
}
