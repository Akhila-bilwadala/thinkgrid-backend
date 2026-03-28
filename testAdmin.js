async function testAdmin() {
  try {
    const resAuth = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@123', password: 'password' })
    });
    const authData = await resAuth.json();
    console.log('Login Status:', resAuth.status);
    console.log('Login Response:', authData.user ? 'User logged in' : authData);

    const token = authData.token;
    if (!token) return;

    const resPending = await fetch('http://localhost:5000/api/admin/pending', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await resPending.text();
    console.log('Pending Status:', resPending.status);
    console.log('Pending Body:', text);
  } catch (err) {
    console.error('Test error:', err);
  }
}

testAdmin();
