async function testStudy() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.mercer@documind.ai', password: 'password123' })
    });
    const { token } = await loginRes.json();
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const docsRes = await fetch('http://localhost:5000/api/documents', { headers: authHeaders });
    const { documents } = await docsRes.json();
    const doc = documents[0];

    const studyRes = await fetch('http://localhost:5000/api/study/generate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ documentId: doc._id || doc.id })
    });
    const studyData = await studyRes.json();
    console.log('✅ Study Pack Generation Success:', studyData.success);
    console.log('   Flashcards:', studyData.studyPack?.flashcards?.length);
    console.log('   MCQs:', studyData.studyPack?.mcqs?.length);
    console.log('   Exam Questions:', studyData.studyPack?.examQuestions?.length);
  } catch (err) {
    console.error('❌ Study test failed:', err);
  }
}

testStudy();
