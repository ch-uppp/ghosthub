/**
 * GitHub API Integration Module
 * Handles authentication and issue creation via GitHub REST API
 */

class GitHubAPI {
  constructor() {
    this.baseUrl = 'https://api.github.com';
    this.token = null;
  }

  /**
   * Set authentication token (Personal Access Token or OAuth token)
   * @param {string} token - GitHub authentication token
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Get authentication headers
   * @returns {Object} Headers object with authentication
   */
  getAuthHeaders() {
    if (!this.token) {
      throw new Error('GitHub token not set. Please configure authentication.');
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json'
    };
  }

  /**
   * Verify authentication by fetching user info
   * @returns {Promise<Object>} User information
   */
  async verifyAuth() {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Authentication verification failed: ${error.message}`);
    }
  }

  /**
   * Create a GitHub issue
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} issueData - Issue data
   * @param {string} issueData.title - Issue title
   * @param {string} issueData.body - Issue description
   * @param {Array<string>} [issueData.labels] - Issue labels
   * @param {Array<string>} [issueData.assignees] - Issue assignees
   * @param {number} [issueData.milestone] - Milestone number
   * @returns {Promise<Object>} Created issue data
   */
  async createIssue(owner, repo, issueData) {
    if (!owner || !repo) {
      throw new Error('Repository owner and name are required');
    }

    if (!issueData.title) {
      throw new Error('Issue title is required');
    }

    const url = `${this.baseUrl}/repos/${owner}/${repo}/issues`;
    
    const payload = {
      title: issueData.title,
      body: issueData.body || '',
    };

    // Add optional fields if provided
    if (issueData.labels && Array.isArray(issueData.labels) && issueData.labels.length > 0) {
      payload.labels = issueData.labels;
    }

    if (issueData.assignees && Array.isArray(issueData.assignees) && issueData.assignees.length > 0) {
      payload.assignees = issueData.assignees;
    }

    if (issueData.milestone) {
      payload.milestone = issueData.milestone;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to create issue: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create GitHub issue: ${error.message}`);
    }
  }

  /**
   * List user's accessible repositories
   * @param {Object} options - Query options
   * @param {string} [options.type='owner'] - Repository type (all, owner, member)
   * @param {string} [options.sort='updated'] - Sort by (created, updated, pushed, full_name)
   * @param {number} [options.per_page=30] - Results per page
   * @returns {Promise<Array>} List of repositories
   */
  async listRepositories(options = {}) {
    const params = new URLSearchParams({
      type: options.type || 'owner',
      sort: options.sort || 'updated',
      per_page: options.per_page || 30
    });

    const url = `${this.baseUrl}/user/repos?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch repositories');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to list repositories: ${error.message}`);
    }
  }

  /**
   * Get repository labels
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} List of labels
   */
  async getLabels(owner, repo) {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/labels`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch labels');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Failed to get labels: ${error.message}`);
    }
  }
}

// Export for use in extension
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GitHubAPI;
}
