const fs = require('fs');

const files = ['src/assets/vite.svg', 'public/favicon.svg'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replace typical Vite logo colors
    content = content.replace(/#863bff/gi, '#EF4444');
    content = content.replace(/#7e14ff/gi, '#DC2626');
    content = content.replace(/#ede6ff/gi, '#FEE2E2');
    content = content.replace(/#47bfff/gi, '#000000');
    content = content.replace(/#9135ff/gi, '#EF4444');
    content = content.replace(/#8900ff/gi, '#DC2626');
    content = content.replace(/#00c2ff/gi, '#000000');
    content = content.replace(/#eee6ff/gi, '#FEE2E2');

    fs.writeFileSync(file, content, 'utf8');
    console.log(`${file} colors replaced!`);
  }
});
