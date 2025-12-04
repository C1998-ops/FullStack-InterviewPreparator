const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../');
const clientDir = path.join(__dirname, '../client');
const outputFile = path.join(clientDir, 'data.json');

// Folders to exclude
const excludeDirs = ['.git', 'node_modules', 'client', 'server', 'scripts', 'assets'];

function getFilesRecursively(dirPath, relativePath = '') {
    const files = [];
    
    try {
        const items = fs.readdirSync(dirPath, { withFileTypes: true });
        
        items.forEach(item => {
            // Skip excluded directories
            if (excludeDirs.includes(item.name) || item.name.startsWith('.')) {
                return;
            }

            const fullPath = path.join(dirPath, item.name);
            const itemRelativePath = path.join(relativePath, item.name);

            if (item.isDirectory()) {
                const children = getFilesRecursively(fullPath, itemRelativePath);
                
                // Only add directory if it has content or is a valid category
                files.push({
                    name: item.name,
                    path: itemRelativePath,
                    isDirectory: true,
                    icon: getFolderIcon(item.name),
                    children: children,
                    hasChildren: children.length > 0
                });
            } else if (item.name.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                files.push({
                    name: item.name.replace('.md', ''),
                    path: itemRelativePath,
                    isDirectory: false,
                    icon: '📄',
                    fileType: 'markdown',
                    content: content // Include content for static access
                });
            } else if (item.name.endsWith('.js') && item.name !== 'generate-static-data.js') {
                const content = fs.readFileSync(fullPath, 'utf8');
                files.push({
                    name: item.name,
                    path: itemRelativePath,
                    isDirectory: false,
                    icon: '📜',
                    fileType: 'javascript',
                    content: content // Include content for static access
                });
            }
        });
    } catch (error) {
        console.error('Error reading directory:', dirPath, error);
    }
    
    return files.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
    });
}

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

console.log('Generating static data...');
const allFiles = getFilesRecursively(rootDir);

// Transform to folder structure format expected by frontend
const folderStructure = {};
allFiles.forEach(item => {
    if (item.isDirectory) {
        folderStructure[item.name] = {
            icon: item.icon,
            files: item.children,
            isDirectory: true
        };
    }
});

const outputData = {
    folders: folderStructure,
    files: allFiles // Also keep flat list if needed, or just rely on structure
};

// We need to structure it exactly as the frontend expects
// Frontend expects:
// 1. /api/folders -> returns object with keys as folder names
// 2. /api/files/:folder -> returns list of files/subfolders in that folder

// To make it static, we'll save the whole tree.
// The frontend will need to be updated to traverse this tree.

fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));
console.log(`Static data generated at: ${outputFile}`);
