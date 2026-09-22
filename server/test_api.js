async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex.mercer@documind.ai', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('✅ Login success:', loginData.success, '| User:', loginData.user?.name);

    const token = loginData.token;
    const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const spacesRes = await fetch('http://localhost:5000/api/spaces', { headers: authHeaders });
    const spacesData = await spacesRes.json();
    console.log('✅ Spaces retrieved:', spacesData.spaces?.length, 'spaces found.');

    const docsRes = await fetch('http://localhost:5000/api/documents', { headers: authHeaders });
    const docsData = await docsRes.json();
    console.log('✅ Documents retrieved:', docsData.documents?.length, 'documents found.');

    const collegeSpace = spacesData.spaces[0];
    const chatRes = await fetch('http://localhost:5000/api/chat/message', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        spaceId: collegeSpace._id || collegeSpace.id,
        content: 'Explain deadlock according to my notes and what conditions cause it.',
        mode: 'ask'
      })
    });
    const chatData = await chatRes.json();
    console.log('✅ Chat response generated with mode:', chatData.assistantMessage?.mode);
    console.log('✅ Citations returned:', chatData.assistantMessage?.citations?.length);
    if (chatData.assistantMessage?.citations?.length > 0) {
      console.log('   Primary citation:', chatData.assistantMessage.citations[0].documentTitle, 'Page:', chatData.assistantMessage.citations[0].pageNumber);
    }
  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

test();
