/**
 * Basic tests for GitHub API integration
 * These tests verify the core functionality without requiring actual API calls
 */

// Mock fetch for testing
const originalFetch = global.fetch;

/**
 * Test GitHubAPI class initialization
 */
function testGitHubAPIInitialization() {
  const api = new GitHubAPI();
  
  if (!api) {
    throw new Error('GitHubAPI should be initialized');
  }
  
  if (api.baseUrl !== 'https://api.github.com') {
    throw new Error('Base URL should be https://api.github.com');
  }
  
  if (api.token !== null) {
    throw new Error('Token should be null initially');
  }
  
  console.log('✓ GitHubAPI initialization test passed');
}

/**
 * Test token setting
 */
function testSetToken() {
  const api = new GitHubAPI();
  const testToken = 'ghp_test_token_123';
  
  api.setToken(testToken);
  
  if (api.token !== testToken) {
    throw new Error('Token should be set correctly');
  }
  
  console.log('✓ Set token test passed');
}

/**
 * Test auth headers generation
 */
function testGetAuthHeaders() {
  const api = new GitHubAPI();
  const testToken = 'ghp_test_token_123';
  
  // Should throw error without token
  try {
    api.getAuthHeaders();
    throw new Error('Should throw error when token is not set');
  } catch (error) {
    if (!error.message.includes('GitHub token not set')) {
      throw error;
    }
  }
  
  // Should work with token
  api.setToken(testToken);
  const headers = api.getAuthHeaders();
  
  if (headers['Authorization'] !== `Bearer ${testToken}`) {
    throw new Error('Authorization header should contain bearer token');
  }
  
  if (headers['Accept'] !== 'application/vnd.github+json') {
    throw new Error('Accept header should be set correctly');
  }
  
  if (headers['X-GitHub-Api-Version'] !== '2022-11-28') {
    throw new Error('API version header should be set correctly');
  }
  
  console.log('✓ Get auth headers test passed');
}

/**
 * Test issue data validation
 */
function testIssueValidation() {
  const api = new GitHubAPI();
  api.setToken('ghp_test_token');
  
  // Mock fetch to prevent actual API calls
  global.fetch = async () => {
    throw new Error('Fetch should not be called in validation tests');
  };
  
  // Test missing owner
  api.createIssue('', 'repo', { title: 'Test' })
    .then(() => {
      throw new Error('Should fail with missing owner');
    })
    .catch(error => {
      if (!error.message.includes('Repository owner and name are required')) {
        throw error;
      }
    });
  
  // Test missing repo
  api.createIssue('owner', '', { title: 'Test' })
    .then(() => {
      throw new Error('Should fail with missing repo');
    })
    .catch(error => {
      if (!error.message.includes('Repository owner and name are required')) {
        throw error;
      }
    });
  
  // Test missing title
  api.createIssue('owner', 'repo', { body: 'Test' })
    .then(() => {
      throw new Error('Should fail with missing title');
    })
    .catch(error => {
      if (!error.message.includes('Issue title is required')) {
        throw error;
      }
    });
  
  global.fetch = originalFetch;
  console.log('✓ Issue validation test passed');
}

/**
 * Run all tests
 */
function runTests() {
  console.log('Running GitHub API tests...\n');
  
  try {
    testGitHubAPIInitialization();
    testSetToken();
    testGetAuthHeaders();
    testIssueValidation();
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Check if running in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  // Load the GitHub API module for testing
  const GitHubAPI = require('./github-api.js');
  global.GitHubAPI = GitHubAPI;
  runTests();
}
