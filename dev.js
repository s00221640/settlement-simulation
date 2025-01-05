// Store file hashes to detect actual changes
let fileHashes = {};

async function getFileContent(file) {
    const response = await fetch(file, {
        headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
        }
    });
    return await response.text();
}

async function checkFile(file) {
    try {
        const content = await getFileContent(file);
        const hash = content.length.toString() + content.charAt(0) + content.charAt(content.length - 1);
        
        if (fileHashes[file] && fileHashes[file] !== hash) {
            console.log(`File changed: ${file}`);
            location.reload();
        }
        
        fileHashes[file] = hash;
    } catch (error) {
        console.log(`Error checking ${file}:`, error);
    }
}

// Only run in development mode
if (location.hostname === '127.0.0.1' || location.hostname === 'localhost') {
    const filesToWatch = [
        'main.js',
        'scripts/map.js',
        'scripts/resources.js',
        'scripts/workers.js'
    ];
    
    // Initial file hash collection
    filesToWatch.forEach(file => checkFile(file));
    
    // Check for changes every 2 seconds
    setInterval(() => {
        filesToWatch.forEach(file => checkFile(file));
    }, 2000);
}