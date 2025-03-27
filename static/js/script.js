document.addEventListener('DOMContentLoaded', () => {
    const projectInput = document.getElementById('project-input');
    const nameSelect = document.getElementById('name-select');
    const commitMessageContainer = document.getElementById('commit-message-container');
    const gitCommitOutput = document.getElementById('git-commit-output');
    const copyButton = document.getElementById('copy-button');

    // Version control elements
    const majorVersion = document.getElementById('major-version');
    const minorVersion = document.getElementById('minor-version');
    const patchVersion = document.getElementById('patch-version');

    // Store current number of commit messages
    let commitCount = 1;

    // Store commit messages
    let savedMessages = [];

    // Theme data with modern names
    const themeData = {
        modern: [
            "Bachman", "Barker", "Belem", "Belson", "Bighetti", "Bream", 
            "Chambers", "Chugtai", "Dunn", "Erlich", "Gavin", "Gilfoyle", 
            "Gregory", "Hall", "Hanneman", "Hendricks", "Jack", "Jared", 
            "LaFlamme", "Laurie", "Melcher", "Monica", "Nelson", "Peter", 
            "Richard", "Ron", "Wei"
        ]
    };

    // Load saved data
    function loadSavedData() {
        const savedProject = localStorage.getItem('lastProject');
        const savedVersion = localStorage.getItem('lastVersion');
        const savedTheme = localStorage.getItem('lastTheme');
        const recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
        const usedThemeNames = JSON.parse(localStorage.getItem('usedThemeNames') || '[]');

        if (savedProject) {
            projectInput.value = savedProject;
            projectInput.classList.add('project-input-active');
            projectInput.readOnly = true;
        }

        if (savedVersion) {
            const [major, minor, patch] = savedVersion.split('.');
            document.getElementById('major-version').textContent = major || '0';
            document.getElementById('minor-version').textContent = minor || '0';
            document.getElementById('patch-version').textContent = patch || '0';
            
            // Update version header
            const versionHeader = document.querySelector('.version-header');
            versionHeader.textContent = `Version ${savedVersion}`;
            versionHeader.classList.add('active');
        }

        if (savedTheme) {
            const themeSelect = document.getElementById('theme-select');
            themeSelect.value = savedTheme;
            themeSelect.classList.add('theme-active');
        }

        displayRecentProjects(recentProjects);
        displayUsedNames(usedThemeNames);
        updateThemeNames();
    }

    // Display recent projects
    function displayRecentProjects(projects) {
        const recentProjects = document.querySelector('.recent-projects');
        const currentProject = projectInput.value;
        
        // Filter out the current project if input is active
        const filteredProjects = projectInput.classList.contains('project-input-active') 
            ? projects.filter(project => project !== currentProject)
            : projects;
            
        recentProjects.innerHTML = filteredProjects
            .map(project => `<div class="recent-project">${project}</div>`)
            .join('');
    }

    // Display used names
    function displayUsedNames(names) {
        const usedNames = document.querySelector('.used-names');
        usedNames.innerHTML = names
            .map(name => `<div class="used-name-tag">${name}</div>`)
            .join('');
    }

    // Display used names in history
    function displayUsedNamesHistory(names) {
        const historyNames = document.querySelector('.history-names');
        historyNames.innerHTML = names
            .map(name => `<div class="history-name-tag">${name}</div>`)
            .join('');
    }

    // Save used name
    function saveName(name) {
        let usedNames = JSON.parse(localStorage.getItem('usedThemeNames') || '[]');
        if (!usedNames.includes(name)) {
            usedNames.unshift(name);
            usedNames = usedNames.slice(0, 5);
            localStorage.setItem('usedThemeNames', JSON.stringify(usedNames));
            displayUsedNames(usedNames);
        }
    }

    // Update theme names
    function updateThemeNames() {
        const theme = document.getElementById('theme-select').value;
        const names = themeData[theme] || [];
        const currentName = nameSelect.value;
        const usedNames = JSON.parse(localStorage.getItem('usedThemeNames') || '[]');
        
        // Filter out used names, except for the currently selected one
        const availableNames = names.filter(name => 
            !usedNames.includes(name) || name === currentName
        );
        
        nameSelect.innerHTML = `
            <option value="">Select Name</option>
            ${availableNames.map(name => `<option value="${name}">${name}</option>`).join('')}
        `;

        // If there's a current name, make sure it's selected
        if (currentName && availableNames.includes(currentName)) {
            nameSelect.value = currentName;
        }

        // Save theme selection
        if (theme) {
            localStorage.setItem('lastTheme', theme);
            document.getElementById('theme-select').classList.add('theme-active');
        }
    }

    // Random name selection
    function selectRandomName() {
        const theme = document.getElementById('theme-select').value;
        if (!theme) return;

        const names = themeData[theme];
        const randomIndex = Math.floor(Math.random() * names.length);
        nameSelect.value = names[randomIndex];
        generateGitCommitCommand();
    }

    // Save project name
    function saveProject(project) {
        localStorage.setItem('lastProject', project);
        let recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
        if (!recentProjects.includes(project)) {
            recentProjects.unshift(project);
            recentProjects = recentProjects.slice(0, 5);
            localStorage.setItem('recentProjects', JSON.stringify(recentProjects));
            displayRecentProjects(recentProjects);
        }
    }

    // Reset all data
    function resetAll() {
        localStorage.clear();
        projectInput.value = '';
        projectInput.readOnly = false;
        projectInput.classList.remove('project-input-active');
        
        const themeSelect = document.getElementById('theme-select');
        themeSelect.value = '';
        themeSelect.classList.remove('theme-active');
        
        nameSelect.value = '';
        document.getElementById('major-version').textContent = '0';
        document.getElementById('minor-version').textContent = '0';
        document.getElementById('patch-version').textContent = '0';
        
        // Reset version header
        const versionHeader = document.querySelector('.version-header');
        versionHeader.textContent = 'Version';
        versionHeader.classList.remove('active');
        
        document.querySelector('.recent-projects').innerHTML = '';
        document.querySelector('.used-names').innerHTML = '';
        updateThemeNames();
        generateGitCommitCommand();
    }

    // Version control handlers
    function updateVersion(type, increment) {
        const element = document.getElementById(`${type}-version`);
        let value = parseInt(element.textContent);
        
        if (increment && value < 99) {
            value++;
        } else if (!increment && value > 0) {
            value--;
        }
        
        element.textContent = value;
        
        // Update version header styling
        const versionHeader = document.querySelector('.version-header');
        versionHeader.textContent = `Version ${getCurrentVersion()}`;
        versionHeader.classList.add('active');
        
        // Save version
        localStorage.setItem('lastVersion', getCurrentVersion());
        
        generateGitCommitCommand();
    }

    // Add click handlers for version controls
    document.querySelectorAll('.version-controls .control-button').forEach(button => {
        button.addEventListener('click', () => {
            const versionType = button.dataset.version;
            const isIncrement = button.classList.contains('plus');
            updateVersion(versionType, isIncrement);
        });
    });

    function getCurrentVersion() {
        return `${majorVersion.textContent}.${minorVersion.textContent}.${patchVersion.textContent}`;
    }

    function createMessageControls(messageIndex) {
        const messageGroup = document.createElement('div');
        messageGroup.classList.add('commit-message-group');

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Enter Commit Message ${messageIndex + 1}`;
        input.classList.add('commit-message-input');
        if (savedMessages[messageIndex]) {
            input.value = savedMessages[messageIndex];
        }
        input.addEventListener('input', generateGitCommitCommand);
        
        // Handle both Enter and Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                const inputs = document.querySelectorAll('.commit-message-input');
                const isLastInput = messageIndex === inputs.length - 1;
                
                if (isLastInput && commitCount < 5) {
                    addCommitMessageAfter(messageIndex);
                } else if (!isLastInput) {
                    // Focus next input if not the last one
                    inputs[messageIndex + 1].focus();
                }
            } else if (e.key === 'Backspace' && input.value === '') {
                e.preventDefault(); // Prevent the default backspace behavior
                const inputs = document.querySelectorAll('.commit-message-input');
                
                // Only delete if we have more than one message and not the first input
                if (commitCount > 1 && messageIndex > 0) {
                    commitCount--;
                    savedMessages.splice(messageIndex, 1);
                    generateCommitMessageInputs();
                    
                    // Focus the previous input at the end of its text
                    const previousInput = document.querySelectorAll('.commit-message-input')[messageIndex - 1];
                    if (previousInput) {
                        previousInput.focus();
                        const length = previousInput.value.length;
                        previousInput.setSelectionRange(length, length);
                    }
                }
            }
        });

        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.classList.add('control-button', 'minus');
        minusBtn.textContent = '-';
        minusBtn.addEventListener('click', () => removeCommitMessage(messageIndex));

        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.classList.add('control-button', 'plus');
        plusBtn.textContent = '+';
        plusBtn.addEventListener('click', () => addCommitMessageAfter(messageIndex));

        messageGroup.appendChild(input);
        messageGroup.appendChild(minusBtn);
        messageGroup.appendChild(plusBtn);

        return messageGroup;
    }

    function generateCommitMessageInputs() {
        // Save current messages before clearing
        savedMessages = Array.from(document.querySelectorAll('.commit-message-input'))
            .map(input => input.value);
        
        commitMessageContainer.innerHTML = '';

        for (let i = 0; i < commitCount; i++) {
            const messageGroup = createMessageControls(i);
            commitMessageContainer.appendChild(messageGroup);
        }

        generateGitCommitCommand();
    }

    function addCommitMessageAfter(index) {
        if (commitCount < 5) {
            commitCount++;
            savedMessages.splice(index + 1, 0, '');
            generateCommitMessageInputs();
            // Focus the newly created input
            const inputs = document.querySelectorAll('.commit-message-input');
            if (inputs[index + 1]) {
                inputs[index + 1].focus();
            }
        }
    }

    function removeCommitMessage(index) {
        if (commitCount > 1) {
            commitCount--;
            savedMessages.splice(index, 1);
    generateCommitMessageInputs();
        }
    }

    // Handle main plus/minus buttons
    document.querySelector('.commit-header .minus').addEventListener('click', () => {
        if (commitCount > 1) {
            commitCount--;
            savedMessages.pop();
            generateCommitMessageInputs();
        }
    });

    document.querySelector('.commit-header .plus').addEventListener('click', () => {
        if (commitCount < 5) {
            commitCount++;
            savedMessages.push('');
            generateCommitMessageInputs();
        }
    });

    // Generate git commit command
    function generateGitCommitCommand() {
        const project = projectInput.value;
        const version = getCurrentVersion();
        const name = nameSelect.value;
        const commitMessages = Array.from(document.querySelectorAll('.commit-message-input'))
            .map(input => input.value.trim())
            .filter(msg => msg !== '')
            .map(msg => msg.replace(/"/g, "'"));

        if (!project || !name) {
            gitCommitOutput.textContent = 'Please fill in all fields';
            return;
        }

        // Build the commit message with proper formatting
        const baseMessage = `Version ${version} - ${name}`;
        const messageLines = commitMessages.length > 0 
            ? commitMessages.map(msg => `-- ${msg}`).join('\n')
            : '';
        
        const gitCommand = commitMessages.length > 0
            ? `git commit -m "${baseMessage}
${messageLines}"`
            : `git commit -m "${baseMessage}"`;

        gitCommitOutput.textContent = gitCommand;
    }

    // Project input handling
    projectInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (projectInput.value.trim()) {
                projectInput.classList.add('project-input-active');
                projectInput.readOnly = true;
                saveProject(projectInput.value);
                // Refresh the recent projects display
                const recentProjects = JSON.parse(localStorage.getItem('recentProjects') || '[]');
                displayRecentProjects(recentProjects);
                generateGitCommitCommand();
            }
        }
    });

    // Also update on input change
    projectInput.addEventListener('input', () => {
        generateGitCommitCommand();
    });

    // Add event listeners to trigger command generation
    [nameSelect].forEach(el => 
        el.addEventListener('change', generateGitCommitCommand)
    );

    // Copy to clipboard functionality
    copyButton.addEventListener('click', () => {
        const currentName = nameSelect.value;
        if (currentName) {
            saveName(currentName); // Only save the name when commit is copied
        }
        
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

    // Initial generation of commit message inputs
    generateCommitMessageInputs();

    // Event Listeners
    const recentProjects = document.querySelector('.recent-projects');
    const themeSelect = document.getElementById('theme-select');
    const randomNameButton = document.querySelector('.random-name');
    const resetButton = document.getElementById('reset-button');

    themeSelect.addEventListener('change', () => {
        if (themeSelect.value) {
            themeSelect.classList.add('theme-active');
            localStorage.setItem('lastTheme', themeSelect.value);
        } else {
            themeSelect.classList.remove('theme-active');
            localStorage.removeItem('lastTheme');
        }
        updateThemeNames();
        generateGitCommitCommand();
    });

    nameSelect.addEventListener('change', () => {
        generateGitCommitCommand();
    });

    randomNameButton.addEventListener('click', selectRandomName);
    resetButton.addEventListener('click', resetAll);

    recentProjects.addEventListener('click', (e) => {
        if (e.target.classList.contains('recent-project')) {
            projectInput.value = e.target.textContent;
            saveProject(projectInput.value);
            generateGitCommitCommand();
        }
    });

    // Generate full git command with add and push
    function generateFullGitCommand() {
        const commitCommand = gitCommitOutput.textContent;
        return `git add .\n${commitCommand}\ngit push`;
    }

    // Commit All button functionality
    const commitAllButton = document.getElementById('commit-all-button');
    const commitAllCheckbox = document.getElementById('commit-all-checkbox');

    commitAllButton.addEventListener('click', () => {
        const command = commitAllCheckbox.checked ? generateFullGitCommand() : gitCommitOutput.textContent;
        
        navigator.clipboard.writeText(command)
            .then(() => {
                commitAllButton.textContent = 'Copied!';
                setTimeout(() => {
                    commitAllButton.textContent = 'Commit All';
                }, 2000);
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
            
        // Save the name if it's being used
        const currentName = nameSelect.value;
        if (currentName) {
            saveName(currentName);
        }
    });

    // Initialize
    loadSavedData();
    updateThemeNames();
});