async function testCompare() {
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
    const docA = documents[0];
    const docB = documents[1];

    const compRes = await fetch('http://localhost:5000/api/compare', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        documentIds: [docA._id || docA.id, docB._id || docB.id]
      })
    });
    const compData = await compRes.json();
    console.log('✅ Document Comparison Success:', compData.success);
    console.log('   Summary:', compData.comparison?.summary);
    console.log('   Similarities count:', compData.comparison?.similarities?.length);
    console.log('   Conflicts count:', compData.comparison?.conflicts?.length);
  } catch (err) {
    console.error('❌ Comparison failed:', err);
  }
}

testCompare();
