const fs = require('fs');
const path = require('path');

const walk = (dir, done) => {
  let results = [];
  fs.readdir(dir, (err, list) => {
    if (err) return done(err);
    let pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(file => {
      file = path.resolve(dir, file);
      fs.stat(file, (err, stat) => {
        if (stat && stat.isDirectory()) {
          walk(file, (err, res) => {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

walk('src', (err, results) => {
  if (err) throw err;
  results.filter(f => f.endsWith('.jsx') || f.endsWith('.css')).forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace CSS vars
    // Before: --primary: #4F46E5; --primary-hover: #4338CA;
    content = content.replace(/--primary: #4F46E5;/g, '--primary: #DC2626;');
    content = content.replace(/--primary-hover: #4338CA;/g, '--primary-hover: #991B1B;');
    content = content.replace(/--primary: #EF4444;/g, '--primary: #EF4444;'); // already close, but dark root wasn't set to this yet.
    // wait, I hadn't updated index.css for dark.

    // Replace Tailwind classes
    content = content.replace(/indigo/g, 'red');
    content = content.replace(/purple/g, 'neutral');
    
    // Replace Hex colors used in Recharts
    // #4F46E5 -> #dc2626
    // #818CF8 -> #f87171
    content = content.replace(/#4F46E5/gi, '#dc2626');
    content = content.replace(/#818CF8/gi, '#f87171');
    content = content.replace(/#38BDF8/gi, '#171717'); // blue -> black for device data

    fs.writeFileSync(file, content, 'utf8');
  });
  console.log("Done replacing colors");
});
