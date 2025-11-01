import React, { useState } from 'react';
import axios from 'axios';

const ConfigForm = ({ onSuccess, onError }) => {
  const [formData, setFormData] = useState({
    phone_number: '',
    github_repo: '',
    permission_type: 'all',
    specific_members: [],
    custom_keywords: [],
    enable_confirmations: true,
    trigger_copilot: false
  });

  const [specificMemberInput, setSpecificMemberInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validateGithubRepo = (repo) => {
    const repoRegex = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+$/;
    return repoRegex.test(repo);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddSpecificMember = (e) => {
    e.preventDefault();
    if (specificMemberInput.trim() && validatePhoneNumber(specificMemberInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specific_members: [...prev.specific_members, specificMemberInput.trim()]
      }));
      setSpecificMemberInput('');
    } else {
      alert('Please enter a valid phone number in international format');
    }
  };

  const removeSpecificMember = (index) => {
    setFormData(prev => ({
      ...prev,
      specific_members: prev.specific_members.filter((_, i) => i !== index)
    }));
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (keywordInput.trim()) {
      setFormData(prev => ({
        ...prev,
        custom_keywords: [...prev.custom_keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      custom_keywords: prev.custom_keywords.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.phone_number) {
      newErrors.phone_number = 'WhatsApp phone number is required';
    } else if (!validatePhoneNumber(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid international phone number (e.g., +447401234567)';
    }

    if (!formData.github_repo) {
      newErrors.github_repo = 'GitHub repository is required';
    } else if (!validateGithubRepo(formData.github_repo)) {
      newErrors.github_repo = 'Please use format: owner/repository (e.g., microsoft/vscode)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Build API payload
    const payload = {
      phoneNumber: formData.phone_number,
      githubRepo: formData.github_repo,
      allowedPhones: formData.permission_type === 'specific' ? formData.specific_members : null,
      customKeywords: formData.custom_keywords.length > 0 ? formData.custom_keywords : [],
      enableConfirmations: formData.enable_confirmations,
      triggerCopilot: formData.trigger_copilot
    };

    try {
      const response = await axios.post(
        '/api/onboard',
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      setIsSubmitting(false);
      onSuccess(response.data);
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to configure bot';
      onError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="config-form">
      {/* WhatsApp Phone Number */}
      <div>
        <label htmlFor="phone_number" className="block text-sm font-semibold text-github-dark mb-2">
          WhatsApp Phone Number <span className="text-github-error">*</span>
        </label>
        <input
          type="text"
          id="phone_number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleInputChange}
          placeholder="+447401234567"
          className={`w-full px-4 py-2 border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-github-accent ${
            errors.phone_number ? 'border-github-error' : 'border-github-border'
          }`}
          data-testid="phone-number-input"
        />
        {errors.phone_number && (
          <p className="mt-1 text-sm text-github-error" data-testid="phone-number-error">{errors.phone_number}</p>
        )}
        <p className="mt-1 text-sm text-github-muted">Enter your WhatsApp number in international format</p>
      </div>

      {/* GitHub Repository */}
      <div>
        <label htmlFor="github_repo" className="block text-sm font-semibold text-github-dark mb-2">
          GitHub Repository <span className="text-github-error">*</span>
        </label>
        <input
          type="text"
          id="github_repo"
          name="github_repo"
          value={formData.github_repo}
          onChange={handleInputChange}
          placeholder="owner/repository"
          className={`w-full px-4 py-2 border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-github-accent ${
            errors.github_repo ? 'border-github-error' : 'border-github-border'
          }`}
          data-testid="github-repo-input"
        />
        {errors.github_repo && (
          <p className="mt-1 text-sm text-github-error" data-testid="github-repo-error">{errors.github_repo}</p>
        )}
        <p className="mt-1 text-sm text-github-muted">Format: owner/repository (e.g., microsoft/vscode)</p>
      </div>

      {/* Permissions */}
      <div>
        <label className="block text-sm font-semibold text-github-dark mb-2">
          Who Can Create Issues?
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="permission_type"
              value="all"
              checked={formData.permission_type === 'all'}
              onChange={handleInputChange}
              className="mr-2"
              data-testid="permission-all"
            />
            <span className="text-github-dark">All group members</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="permission_type"
              value="me"
              checked={formData.permission_type === 'me'}
              onChange={handleInputChange}
              className="mr-2"
              data-testid="permission-me"
            />
            <span className="text-github-dark">Only me</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="permission_type"
              value="specific"
              checked={formData.permission_type === 'specific'}
              onChange={handleInputChange}
              className="mr-2"
              data-testid="permission-specific"
            />
            <span className="text-github-dark">Specific members</span>
          </label>
        </div>

        {formData.permission_type === 'specific' && (
          <div className="mt-4 p-4 border border-github-border rounded-md">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={specificMemberInput}
                onChange={(e) => setSpecificMemberInput(e.target.value)}
                placeholder="+447401234567"
                className="flex-1 px-4 py-2 border border-github-border rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-github-accent"
                data-testid="specific-member-input"
              />
              <button
                onClick={handleAddSpecificMember}
                type="button"
                className="px-4 py-2 bg-github-dark text-white rounded-md hover:bg-opacity-90 transition-colors"
                data-testid="add-member-button"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.specific_members.map((member, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-mono"
                  data-testid={`member-chip-${index}`}
                >
                  {member}
                  <button
                    onClick={() => removeSpecificMember(index)}
                    type="button"
                    className="text-github-error hover:text-red-700"
                    data-testid={`remove-member-${index}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Keywords */}
      <div>
        <label className="block text-sm font-semibold text-github-dark mb-2">
          Additional Keywords (Optional)
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="urgent, critical, blocker"
            className="flex-1 px-4 py-2 border border-github-border rounded-md focus:outline-none focus:ring-2 focus:ring-github-accent"
            data-testid="keyword-input"
          />
          <button
            onClick={handleAddKeyword}
            type="button"
            className="px-4 py-2 bg-github-dark text-white rounded-md hover:bg-opacity-90 transition-colors"
            data-testid="add-keyword-button"
          >
            Add
          </button>
        </div>
        <p className="text-sm text-github-muted mb-2">Add custom keywords beyond the defaults</p>
        <div className="flex flex-wrap gap-2">
          {formData.custom_keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm"
              data-testid={`keyword-chip-${index}`}
            >
              {keyword}
              <button
                onClick={() => removeKeyword(index)}
                type="button"
                className="text-github-error hover:text-red-700"
                data-testid={`remove-keyword-${index}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* WhatsApp Confirmations */}
      <div className="flex items-center justify-between p-4 border border-github-border rounded-md">
        <div>
          <label htmlFor="enable_confirmations" className="block text-sm font-semibold text-github-dark">
            Send confirmation messages in WhatsApp
          </label>
          <p className="text-sm text-github-muted">Bot will reply in the group when an issue is created</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="enable_confirmations"
            name="enable_confirmations"
            checked={formData.enable_confirmations}
            onChange={handleInputChange}
            className="sr-only peer"
            data-testid="confirmations-toggle"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-github-accent"></div>
        </label>
      </div>

      {/* GitHub Copilot Assignment */}
      <div className="flex items-center justify-between p-4 border border-github-border rounded-md">
        <div>
          <label htmlFor="trigger_copilot" className="block text-sm font-semibold text-github-dark">
            Assign issues to GitHub Copilot
          </label>
          <p className="text-sm text-github-muted">Automatically assign created issues to GitHub Copilot</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id="trigger_copilot"
            name="trigger_copilot"
            checked={formData.trigger_copilot}
            onChange={handleInputChange}
            className="sr-only peer"
            data-testid="copilot-toggle"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-github-accent"></div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-3 bg-github-accent text-white font-semibold rounded-md hover:bg-github-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        data-testid="submit-button"
      >
        {isSubmitting ? 'Configuring...' : 'Configure Bot'}
      </button>
    </form>
  );
};

export default ConfigForm;
