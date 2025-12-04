const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// Define root directory (one level up from server folder)
const rootDir = path.join(__dirname, '../');

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '../client')));

// CORS middleware to allow requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Get folder structure
app.get('/api/folders', (req, res) => {
    try {
        const folders = {};
        
        // Read all directories from root
        const items = fs.readdirSync(rootDir, { withFileTypes: true });
        
        items.forEach(item => {
            if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules' && item.name !== 'client' && item.name !== 'server') {
                folders[item.name] = {
                    icon: getFolderIcon(item.name),
                    files: [],
                    isDirectory: true
                };
            }
        });
        
        res.json(folders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to read folders' });
    }
});

// Get files in a specific folder
app.get('/api/files/:folder', (req, res) => {
    try {
        const folderName = decodeURIComponent(req.params.folder);
        const folderPath = path.join(rootDir, folderName);
        
        if (!fs.existsSync(folderPath)) {
            return res.status(404).json({ error: 'Folder not found' });
        }
        
        // Fix: Pass empty string as relative path to avoid duplicating folder name
        const files = getFilesRecursively(folderPath, '');
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read files' });
    }
});

// Get markdown file content
app.get('/api/file/:folder/:file(*)', (req, res) => {
    try {
        const folderName = decodeURIComponent(req.params.folder);
        const fileName = decodeURIComponent(req.params.file);
        
        // Try different possible file paths
        const possiblePaths = [
            path.join(rootDir, folderName, fileName),
            path.join(rootDir, folderName, fileName + '.md'),
            path.join(rootDir, folderName, fileName, 'README.md'),
        ];
        
        let filePath = null;
        let content = '';
        
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                filePath = possiblePath;
                break;
            }
        }
        
        if (!filePath) {
            // If no direct file found, look for any .md files in the subfolder
            const subFolderPath = path.join(rootDir, folderName, fileName);
            if (fs.existsSync(subFolderPath) && fs.statSync(subFolderPath).isDirectory()) {
                const mdFiles = fs.readdirSync(subFolderPath).filter(f => f.endsWith('.md'));
                if (mdFiles.length > 0) {
                    filePath = path.join(subFolderPath, mdFiles[0]);
                }
            }
        }
        
        if (filePath && fs.existsSync(filePath)) {
            content = fs.readFileSync(filePath, 'utf8');
            // Return path relative to root
            res.json({ content, filePath: filePath.replace(rootDir, '') });
        } else {
            res.status(404).json({ 
                error: 'File not found', 
                searched: possiblePaths.map(p => p.replace(rootDir, ''))
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to read file', details: error.message });
    }
});

// Helper function to get files recursively with nested structure
function getFilesRecursively(dirPath, relativePath = '') {
    const files = [];
    
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        items.forEach(item => {
            if (item.isDirectory()) {
                // Add directory with its children
                const subPath = path.join(dirPath, item.name);
                const children = getFilesRecursively(subPath, path.join(relativePath, item.name));
                
                files.push({
                    name: item.name,
                    path: path.join(relativePath, item.name),
                    isDirectory: true,
                    icon: '📁',
                    children: children,
                    hasChildren: children.length > 0
                });
            } else if (item.name.endsWith('.md')) {
                // Add markdown files
                files.push({
                    name: item.name.replace('.md', ''),
                    path: path.join(relativePath, item.name),
                    isDirectory: false,
                    icon: '📄',
                    fileType: 'markdown'
                });
            } else if (item.name.endsWith('.js')) {
                // Add JavaScript files
                files.push({
                    name: item.name,
                    path: path.join(relativePath, item.name),
                    isDirectory: false,
                    icon: '📜',
                    fileType: 'javascript'
                });
            }
        });
    } catch (error) {
        console.error('Error reading directory:', dirPath, error);
    }
    
    return files.sort((a, b) => {
        // Directories first, then files
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
    });
}

// Helper function to get folder icons
function getFolderIcon(folderName) {
    const icons = {
        "Angular-Topics-Interview": "🅰️",
        "React": "⚛️",
        "Javascript": "📜",
        "Redux": "🔄",
        "Node-Express": "🟢",
        "CSS": "🎨",
        "MongoDB": "🍃",
        "Promise-Async-Await-Sequential-Execution": "⏳",
        "Event-Loop-Asynchronous-setTimeout": "🔄",
        "Fundamental-Algorithms-JS": "🧮",
        "Collection-of-Popular-Problems-with-Solutions": "💡",
        "Challenges-from-Popular-Coding-Practice-sites": "🏆",
        "Collection-of-TakeHome-Exercises": "📝",
        "Git-and-Github": "🌿",
        "system-design": "🏗️",
        "Web-Development-In-General": "🌐",
        "Collections-of-Questions-NOT-drafted-Ans": "❓",
        "GraphQL": "🔗",
        "Heroku": "☁️",
        "HTML": "📄",
        "Typscript": "📘",
        "webpack": "📦",
        "Common-Problem-Set": "🧩",
        "General-Soft_Getting_to_Know_Interview_Questions": "🗣️"
    };
    
    return icons[folderName] || "📁";
}

app.listen(port, () => {
    console.log(`Interview Prep Server running at http://localhost:${port}`);
    console.log('Open http://localhost:3000 in your browser');
});
