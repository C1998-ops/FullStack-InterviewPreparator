import { marked } from 'marked';
import '../styles/style.css';

const folderIcons = {
  'Angular-Topics-Interview': '🅰️',
  React: '⚛️',
  Javascript: '📜',
  Redux: '🔄',
  'Node-Express': '🟢',
  CSS: '🎨',
  MongoDB: '🍃',
  'Promise-Async-Await-Sequential-Execution': '⏳',
  'Event-Loop-Asynchronous-setTimeout': '🔄',
  'Fundamental-Algorithms-JS': '🧮',
  'Collection-of-Popular-Problems-with-Solutions': '💡',
  'Challenges-from-Popular-Coding-Practice-sites': '🏆',
  'Collection-of-TakeHome-Exercises': '📝',
  'Git-and-Github': '🌿',
  'system-design': '🏗️',
  'Web-Development-In-General': '🌐',
  'Collections-of-Questions-NOT-drafted-Ans': '❓',
  GraphQL: '🔗',
  Heroku: '☁️',
  HTML: '📄',
  Typescript: '📘',
  webpack: '📦',
  'Common-Problem-Set': '🧩',
  'General-Soft_Getting_to_Know_Interview_Questions': '🗣️',
};

let folderStructure = {};
let currentFolder = null;
let currentFile = null;

async function init() {
  await loadFolderStructure();
  renderFolderTree();
  setupSearchFunctionality();
}

async function loadFolderStructure() {
  try {
    // Try to fetch static data.json first (for GitHub/Amplify)
    const response = await fetch('data.json');
    if (response.ok) {
      const data = await response.json();
      folderStructure = data.folders;
      console.log('Loaded static data');
      return;
    }
  } catch (e) {
    console.log('Static data not found, trying API...');
  }

  try {
    // Fallback to API (for local dev server)
    const response = await fetch('/api/folders');
    if (response.ok) {
      const folders = await response.json();
      folderStructure = folders;
    } else {
      await loadBasicFolderStructure();
    }
  } catch (error) {
    console.log('Server not available, using basic structure');
    await loadBasicFolderStructure();
  }
}

async function loadBasicFolderStructure() {
  const knownFolders = Object.keys(folderIcons);
  for (const folder of knownFolders) {
    folderStructure[folder] = {
      icon: folderIcons[folder] || '📁',
      files: [],
      isDirectory: true,
    };
  }
}

function renderFolderTree() {
  const folderTree = document.getElementById('folderTree');
  folderTree.innerHTML = '';

  Object.entries(folderStructure).forEach(([folderName, folderData]) => {
    const folderElement = createFolderElement(folderName, folderData);
    folderTree.appendChild(folderElement);
  });
}

function createFolderElement(folderName, folderData) {
  const folder = document.createElement('div');
  folder.className = 'folder';

  const header = document.createElement('div');
  header.className = 'folder-header';
  header.onclick = () => toggleFolder(folderName, header);

  header.innerHTML = `
          <span class="folder-icon">${folderData.icon}</span>
          <span class="folder-name">${formatFolderName(folderName)}</span>
      `;

  const fileList = document.createElement('div');
  fileList.className = 'file-list';
  fileList.id = `files-${folderName}`;

  folder.appendChild(header);
  folder.appendChild(fileList);

  return folder;
}

function formatFolderName(name) {
  return name.replace(/-/g, ' ').replace(/_/g, ' ');
}

function toggleFolder(folderName, headerElement) {
  const fileList = document.getElementById(`files-${folderName}`);
  const wasOpen = fileList.classList.contains('open');

  document.querySelectorAll('.file-list').forEach((list) => {
    list.classList.remove('open');
  });
  document.querySelectorAll('.folder-header').forEach((header) => {
    header.classList.remove('active');
  });

  if (!wasOpen) {
    fileList.classList.add('open');
    headerElement.classList.add('active');
    currentFolder = folderName;
    loadFolderContents(folderName);
  } else {
    currentFolder = null;
    showEmptyState();
  }
}

async function loadFolderContents(folderName) {
  const fileList = document.getElementById(`files-${folderName}`);
  fileList.innerHTML = '<div class="loading">Loading files...</div>';

  try {
    const files = await getFilesInFolder(folderName);
    renderFileList(folderName, files, fileList);
  } catch (error) {
    fileList.innerHTML = '<div class="error">Error loading files</div>';
  }
}

async function getFilesInFolder(folderName) {
  // If we have static data structure, the files are already nested in it
  if (
    folderStructure[folderName] &&
    folderStructure[folderName].files &&
    folderStructure[folderName].files.length > 0
  ) {
    return folderStructure[folderName].files;
  }

  try {
    const response = await fetch(`/api/files/${encodeURIComponent(folderName)}`);
    if (response.ok) {
      const files = await response.json();
      return files;
    }
  } catch (error) {
    console.log('Server-side file listing not available');
  }

  return folderStructure[folderName]?.files || [];
}

function renderFileList(folderName, files, parentElement, level = 0) {
  parentElement.innerHTML = '';

  if (files.length === 0) {
    parentElement.innerHTML =
      '<div style="padding: 1rem; color: #6c757d; font-size: 0.8rem;">No files found</div>';
    return;
  }

  files.forEach((fileData) => {
    const fileName = fileData.name;
    const filePath = fileData.path;
    const isDirectory = fileData.isDirectory;
    const icon = fileData.icon || '📄';
    const hasChildren = fileData.hasChildren || false;
    const children = fileData.children || [];

    if (isDirectory && hasChildren) {
      // Create subfolder with expand/collapse
      const subfolderContainer = document.createElement('div');

      const fileElement = document.createElement('div');
      fileElement.className = 'file-item';
      fileElement.style.paddingLeft = `${2 + level * 1}rem`;
      fileElement.innerHTML = `
                  <span class="file-icon">▶</span>
                  <span class="file-icon">${icon}</span>
                  <span>${formatFolderName(fileName)}</span>
              `;

      const subFileList = document.createElement('div');
      subFileList.style.display = 'none';
      subFileList.className = 'subfolder-list';

      fileElement.onclick = (e) => {
        e.stopPropagation();
        const arrow = fileElement.querySelector('.file-icon:first-child');
        if (subFileList.style.display === 'none') {
          subFileList.style.display = 'block';
          arrow.textContent = '▼';
          if (subFileList.children.length === 0) {
            renderFileList(folderName, children, subFileList, level + 1);
          }
        } else {
          subFileList.style.display = 'none';
          arrow.textContent = '▶';
        }
      };

      subfolderContainer.appendChild(fileElement);
      subfolderContainer.appendChild(subFileList);
      parentElement.appendChild(subfolderContainer);
    } else {
      // Regular file
      const fileElement = document.createElement('div');
      fileElement.className = 'file-item';
      fileElement.style.paddingLeft = `${2 + level * 1}rem`;

      fileElement.onclick = () =>
        loadFile(folderName, filePath, fileElement, fileData.fileType);

      fileElement.innerHTML = `
                  <span class="file-icon">${icon}</span>
                  <span>${formatFolderName(fileName)}</span>
              `;

      parentElement.appendChild(fileElement);
    }
  });
}

async function loadFile(folderName, filePath, fileElement, fileType = 'markdown') {
  document.querySelectorAll('.file-item').forEach((item) => {
    item.classList.remove('active');
  });
  fileElement.classList.add('active');

  currentFile = filePath;
  showContent();
  updateBreadcrumb(folderName, filePath);

  const content = document.getElementById('markdownContent');
  content.innerHTML = '<div class="loading">Loading content...</div>';

  // Check if we have the content in our static structure
  const fileContent = findContentInStructure(folderName, filePath);

  if (fileContent) {
    renderContent(content, fileContent, fileType, filePath);
    return;
  }

  try {
    const response = await fetch(
      `/api/file/${encodeURIComponent(folderName)}/${encodeURIComponent(filePath)}`
    );
    if (response.ok) {
      const data = await response.json();
      renderContent(content, data.content, fileType, filePath);
    } else {
      showError(content, folderName, filePath);
    }
  } catch (error) {
    showError(content, folderName, filePath, true);
  }
}

function findContentInStructure(folderName, filePath) {
  let foundContent = null;

  function search(items) {
    if (!items) return;
    for (const item of items) {
      if (item.path === filePath && item.content) {
        foundContent = item.content;
        return;
      }
      if (item.children) {
        search(item.children);
        if (foundContent) return;
      }
    }
  }

  if (folderStructure[folderName]) {
    search(folderStructure[folderName].files);
  }

  return foundContent;
}

function renderContent(container, contentText, fileType, filePath) {
  if (fileType === 'javascript' || filePath.endsWith('.js')) {
    container.innerHTML = `
              <h2>📜 ${filePath.split('/').pop()}</h2>
              <pre><code>${escapeHtml(contentText)}</code></pre>
          `;
  } else {
    const html = marked.parse(contentText);
    container.innerHTML = html;
  }
}

function showError(container, folderName, filePath, isNetworkError = false) {
  if (isNetworkError) {
    container.innerHTML = `
              <div class="error">
                  <h3>Error loading file</h3>
                  <p>Make sure the server is running or data.json is generated.</p>
              </div>
          `;
  } else {
    container.innerHTML = `
              <div class="error">
                  <h3>File not found</h3>
                  <p>Could not load: ${folderName}/${filePath}</p>
              </div>
          `;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showContent() {
  document.getElementById('contentEmpty').style.display = 'none';
  document.getElementById('contentArea').style.display = 'block';
}

function showEmptyState() {
  document.getElementById('contentEmpty').style.display = 'flex';
  document.getElementById('contentArea').style.display = 'none';
}

function updateBreadcrumb(folderName, fileName) {
  const breadcrumb = document.getElementById('breadcrumb');
  breadcrumb.textContent = `📁 ${formatFolderName(
    folderName
  )} > 📄 ${formatFolderName(fileName)}`;
}

function setupSearchFunctionality() {
  const searchInput = document.getElementById('searchInput');
  const clearButton = document.getElementById('clearSearch');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    // Show clear button when there's text, hide when empty
    if (query.length > 0) {
      clearButton.style.display = 'block';
    } else {
      clearButton.style.display = 'none';
    }

    filterFolders(query);
  });
}

function filterFolders(query) {
  const folders = document.querySelectorAll('.folder');
  const emptyTree = document.getElementById('emptyTree');
  let visibleCount = 0;

  folders.forEach((folder) => {
    const folderName = folder.querySelector('.folder-name').textContent.toLowerCase();

    if (folderName.includes(query)) {
      folder.style.display = 'block';
      visibleCount++;
    } else {
      folder.style.display = 'none';
    }
  });

  // Show empty message only if no folders are visible and there's a search query
  if (query.length > 0 && visibleCount === 0) {
    emptyTree.style.display = 'block';
    emptyTree.textContent = 'No folders found. Try searching with different keywords.';
  } else {
    emptyTree.style.display = 'none';
    emptyTree.textContent = '';
  }
}

function clearSearchTopics() {
  const button = document.getElementById('clearSearch');
  button.addEventListener('click', () => {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    filterFolders('');
    button.style.display = 'none';
  });
}
clearSearchTopics();

function setupHamburgerMenu() {
  const hamburger = document.getElementById('hamburger');
  const sidebar = document.querySelector('.sidebar');

  // Initialize sidebar state
  if (window.innerWidth > 768) {
    sidebar.classList.add('open');
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.remove('open');
        hamburger.classList.remove('active');
      }
    }
  });
}
setupHamburgerMenu();

document.addEventListener('DOMContentLoaded', init);

