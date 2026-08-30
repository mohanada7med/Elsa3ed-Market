async function check() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'seller1', password: 'password123' })
  });
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}
check();
