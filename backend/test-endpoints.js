import { exec } from 'child_process';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION ENDPOINT TESTS ---');
  
  const testEmail = `test_dev_${Date.now()}@example.com`;
  const testPassword = 'securepassword123';
  const testName = 'Test Developer';
  let token = '';
  let userId = '';
  let workspaceId = '';
  let apiKey = '';

  try {
    // 1. Register User
    console.log('\n[1] Testing Auth Register...');
    const registerResp = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
    });
    
    if (!registerResp.ok) {
      throw new Error(`Register failed with status: ${registerResp.status}`);
    }
    const registerData = await registerResp.json();
    console.log('✅ Register success:', registerData.email);

    // 2. Login User
    console.log('\n[2] Testing Auth Login...');
    const loginResp = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    
    if (!loginResp.ok) {
      throw new Error(`Login failed with status: ${loginResp.status}`);
    }
    const loginData = await loginResp.json();
    token = loginData.token;
    userId = loginData._id;
    console.log('✅ Login success! Received JWT Token.');

    // 3. Fetch User Profile
    console.log('\n[3] Testing Get Profile...');
    const profileResp = await fetch(`${BASE_URL}/user/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!profileResp.ok) {
      throw new Error(`Get Profile failed with status: ${profileResp.status}`);
    }
    const profileData = await profileResp.json();
    console.log('✅ Get Profile success. Name:', profileData.name, 'Role:', profileData.role);

    // 4. Update Profile (Custom Rules, generate API key)
    console.log('\n[4] Testing Update Profile (customRules & generateApiKey)...');
    const updateResp = await fetch(`${BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        customRules: ['Enforce camelCase for all variables'],
        generateApiKey: true
      })
    });
    
    if (!updateResp.ok) {
      throw new Error(`Update Profile failed with status: ${updateResp.status}`);
    }
    const updatedData = await updateResp.json();
    apiKey = updatedData.apiKey;
    console.log('✅ Update Profile success. Created API Key:', apiKey);
    console.log('Rules stored:', updatedData.customRules);

    // 5. Create Team Workspace
    console.log('\n[5] Testing Create Team Workspace...');
    const workspaceCreateResp = await fetch(`${BASE_URL}/workspace`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: 'DevInspect AI Team Workspace' })
    });
    
    if (!workspaceCreateResp.ok) {
      throw new Error(`Create Workspace failed with status: ${workspaceCreateResp.status}`);
    }
    const workspaceData = await workspaceCreateResp.json();
    workspaceId = workspaceData._id;
    console.log('✅ Create Workspace success. Workspace ID:', workspaceId, 'Name:', workspaceData.name);

    // 6. Fetch Workspace List
    console.log('\n[6] Testing Get Workspaces...');
    const workspacesGetResp = await fetch(`${BASE_URL}/workspace`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!workspacesGetResp.ok) {
      throw new Error(`Get Workspaces failed with status: ${workspacesGetResp.status}`);
    }
    const workspacesList = await workspacesGetResp.json();
    console.log('✅ Get Workspaces success. Found workspaces:', workspacesList.length);

    // 7. Run AI Code Analysis
    console.log('\n[7] Testing AI Code Analysis (Standard Route)...');
    const analysisResp = await fetch(`${BASE_URL}/analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: 'const x = "secret_key_value";\nconsole.log(x);',
        mode: 'developer',
        language: 'javascript',
        workspaceId
      })
    });
    
    if (!analysisResp.ok) {
      throw new Error(`AI Analysis failed with status: ${analysisResp.status}`);
    }
    const analysisData = await analysisResp.json();
    console.log('✅ AI Analysis success. Mode:', analysisData.mode, 'Language:', analysisData.language);
    console.log('Analysis Explanation:', analysisData.result?.explanation);

    // 8. Fetch Analysis History
    console.log('\n[8] Testing Fetch Analysis History...');
    const historyResp = await fetch(`${BASE_URL}/analysis`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!historyResp.ok) {
      throw new Error(`Fetch History failed with status: ${historyResp.status}`);
    }
    const historyList = await historyResp.json();
    console.log('✅ Fetch History success. Found records:', historyList.length);

    // 9. Test CI/CD endpoint using the X-API-Key
    console.log('\n[9] Testing CI/CD Pipeline Endpoint (X-API-Key)...');
    const ciResp = await fetch(`${BASE_URL}/ci/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        code: 'def sum(a,b):\n  return a+b',
        mode: 'student',
        language: 'python'
      })
    });
    
    if (!ciResp.ok) {
      throw new Error(`CI Endpoint failed with status: ${ciResp.status}`);
    }
    const ciData = await ciResp.json();
    console.log('✅ CI/CD trigger success! Returned analysis object.');
    console.log('CI Explanation:', ciData.analysis?.explanation);

    console.log('\n--- ALL API ENDPOINT TESTS PASSED SUCCESSFULY ---');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runTests();
