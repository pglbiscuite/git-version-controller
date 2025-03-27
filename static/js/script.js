document.addEventListener('DOMContentLoaded', () => {
    const projectSelect = document.getElementById('project-select');
    const versionSelect = document.getElementById('version-select');
    const nameSelect = document.getElementById('name-select');
    const commitCountInput = document.getElementById('commit-count');
    const commitMessageContainer = document.getElementById('commit-message-container');
    const gitCommitOutput = document.getElementById('git-commit-output');
    const copyButton = document.getElementById('copy-button');

    // Store commit messages
    let savedMessages = [];

    // Dynamic commit message generation
    commitCountInput.addEventListener('change', generateCommitMessageInputs);

    function generateCommitMessageInputs() {
        const count = parseInt(commitCountInput.value);
        
        // Save current messages before clearing the container
        savedMessages = Array.from(document.querySelectorAll('.commit-message-input'))
            .map(input => input.value);
        
        commitMessageContainer.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const messageGroup = document.createElement('div');
            messageGroup.classList.add('dropdown-group');

            const label = document.createElement('label');
            label.textContent = `Commit Message ${i + 1}`;
            label.htmlFor = `commit-message-${i + 1}`;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `commit-message-${i + 1}`;
            input.placeholder = 'Enter commit message';
            input.classList.add('commit-message-input');
            
            // Restore saved message if it exists
            if (savedMessages[i]) {
                input.value = savedMessages[i];
            }
            
            // Add input event listener for live updates
            input.addEventListener('input', generateGitCommitCommand);

            messageGroup.appendChild(label);
            messageGroup.appendChild(input);
            commitMessageContainer.appendChild(messageGroup);
        }

        // Update the git command after regenerating inputs
        generateGitCommitCommand();
    }

    // Initial generation of commit message inputs
    generateCommitMessageInputs();

    // Note: In a real implementation, these would be populated from the backend
    const mockProjects = ['Project A', 'Project B', 'Web App'];
    const mockNames = ['Alice', 'Bob', 'Charlie'];

    // Populate project dropdown
    mockProjects.forEach(project => {
        const option = document.createElement('option');
        option.value = project;
        option.textContent = project;
        projectSelect.appendChild(option);
    });

    // Populate name dropdown
    mockNames.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        nameSelect.appendChild(option);
    });

    // Generate git commit command
    function generateGitCommitCommand() {
        const project = projectSelect.value;
        const version = versionSelect.value;
        const name = nameSelect.value;
        const commitMessages = Array.from(document.querySelectorAll('.commit-message-input'))
            .map(input => input.value)
            .filter(msg => msg.trim() !== '');

        if (!project || !version || !name || commitMessages.length === 0) {
            gitCommitOutput.textContent = 'Please fill in all fields';
            return;
        }

        const formattedMessages = commitMessages
            .map(msg => `-- ${msg}`)
            .join('\n');

        const gitCommand = `git commit -m "Version ${version} - ${name}\n${formattedMessages}"`;
        gitCommitOutput.textContent = gitCommand;
    }

    // Add event listeners to trigger command generation
    [projectSelect, versionSelect, nameSelect, commitCountInput]
        .forEach(el => el.addEventListener('change', generateGitCommitCommand));

    document.querySelectorAll('.commit-message-input')
        .forEach(input => input.addEventListener('input', generateGitCommitCommand));

    // Copy to clipboard functionality
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(gitCommitOutput.textContent)
            .then(() => {
                copyButton.textContent = 'Copied!';
                setTimeout(() => {
                    copyButton.textContent = 'Copy Commit Command';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });
});