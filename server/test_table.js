async function testTableIntelligence() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.mercer@documind.ai', password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const docsRes = await fetch('http://localhost:5000/api/documents', { headers: authHeaders });
    const docsData = await docsRes.json();
    const salesDoc = docsData.documents.find(d => d.fileType === 'csv');

    console.log('Testing table calculation on:', salesDoc?.title);

    const calcRes = await fetch('http://localhost:5000/api/chat/message', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        spaceId: salesDoc.spaceId,
        documentId: salesDoc._id || salesDoc.id,
        content: 'What was the highest revenue month and calculate average revenue?',
        mode: 'analyze'
      })
    });
    const calcData = await calcRes.json();
    console.log('✅ Table Answer:\n', calcData.assistantMessage?.content);
  } catch (err) {
    console.error('❌ Table calculation failed:', err);
  }
}

testTableIntelligence();
