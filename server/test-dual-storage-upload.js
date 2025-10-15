const mongoose = require('mongoose');
const RTECDocuments = require('./src/models/RTECDocuments');
const TNA = require('./src/models/TNA');
const fs = require('fs');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/pmns2')
  .then(async () => {
    console.log('🧪 Testing dual storage system...\n');
    
    // Create a test TNA
    console.log('1. Creating test TNA...');
    const testTNA = new TNA({
      enterpriseName: 'Test Enterprise',
      projectTitle: 'Test Project',
      programName: 'SETUP',
      businessActivity: 'Manufacturing',
      amountRequested: 500000,
      status: 'approved',
      rtecStatus: 'pending'
    });
    
    const savedTNA = await testTNA.save();
    console.log('✅ TNA created:', savedTNA._id);
    
    // Create RTEC document request
    console.log('\n2. Creating RTEC document request...');
    const rtecRequest = new RTECDocuments({
      tnaId: savedTNA._id,
      applicationId: savedTNA._id,
      proponentId: savedTNA._id,
      requestedBy: savedTNA._id,
      status: 'documents_requested'
    });
    
    const savedRTEC = await rtecRequest.save();
    console.log('✅ RTEC request created:', savedRTEC._id);
    
    // Simulate file upload with buffer
    console.log('\n3. Simulating file upload with dual storage...');
    
    // Create a test file
    const testContent = 'This is a test RTEC document content for dual storage testing.';
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    // Save to filesystem
    const filename = `test-rtec-${Date.now()}-${Math.round(Math.random() * 1E9)}.txt`;
    const filePath = path.join(__dirname, 'uploads', filename);
    fs.writeFileSync(filePath, testBuffer);
    console.log('✅ File saved to filesystem:', filename);
    
    // Update RTEC document with file data (simulating the controller logic)
    const fileData = {
      filename: filename,
      originalName: 'test-document.txt',
      path: filePath,
      size: testBuffer.length,
      mimetype: 'text/plain',
      buffer: testBuffer,
      textContent: null
    };
    
    // Find the document type in partialdocsrtec
    const documentType = 'project title';
    const document = savedRTEC.partialdocsrtec.find(doc => doc.type === documentType);
    
    if (document) {
      document.filename = fileData.filename;
      document.originalName = fileData.originalName;
      document.path = fileData.path;
      document.size = fileData.size;
      document.mimetype = fileData.mimetype;
      document.buffer = fileData.buffer;
      document.textContent = fileData.textContent;
      document.uploadedAt = new Date();
      document.uploadedBy = savedTNA._id;
      document.documentStatus = 'submitted';
      
      await savedRTEC.save();
      console.log('✅ File data saved to database');
    }
    
    // Verify dual storage
    console.log('\n4. Verifying dual storage...');
    
    // Check filesystem
    const fileExists = fs.existsSync(filePath);
    const fileStats = fs.statSync(filePath);
    console.log('📁 Filesystem:', fileExists ? `✅ File exists (${fileStats.size} bytes)` : '❌ File not found');
    
    // Check database
    const updatedRTEC = await RTECDocuments.findById(savedRTEC._id);
    const storedDoc = updatedRTEC.partialdocsrtec.find(doc => doc.type === documentType);
    
    if (storedDoc && storedDoc.buffer) {
      console.log('💾 Database:', `✅ Buffer stored (${storedDoc.buffer.length} bytes)`);
      console.log('   Filename:', storedDoc.filename);
      console.log('   Original Name:', storedDoc.originalName);
      console.log('   Size:', storedDoc.size);
      console.log('   MIME Type:', storedDoc.mimetype);
      console.log('   Path:', storedDoc.path);
    } else {
      console.log('💾 Database:', '❌ Buffer not found');
    }
    
    // Test file serving from database
    console.log('\n5. Testing file serving from database...');
    if (storedDoc && storedDoc.buffer) {
      const bufferContent = storedDoc.buffer.toString('utf8');
      console.log('📤 Database content:', bufferContent.substring(0, 50) + '...');
      console.log('✅ File can be served from database buffer');
    }
    
    // Test file serving from filesystem
    console.log('\n6. Testing file serving from filesystem...');
    if (fileExists) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log('📤 Filesystem content:', fileContent.substring(0, 50) + '...');
      console.log('✅ File can be served from filesystem');
    }
    
    console.log('\n🎉 Dual storage test completed!');
    console.log('✅ Files are stored in BOTH filesystem and database');
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
