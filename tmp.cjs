const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/bg-\[\#111\]/g, 'bg-surface-low')
    .replace(/bg-\[\#111111\]/g, 'bg-surface-low')
    .replace(/bg-\[\#1a1a1a\]/g, 'bg-surface')
    .replace(/bg-\[\#0c0c0c\]/g, 'bg-surface-lowest')
    .replace(/bg-\[\#0f1712\]/g, 'bg-surface-lowest')
    .replace(/border-white\/5(?!0)/g, 'border-border/30')
    .replace(/border-white\/10/g, 'border-border/40')
    .replace(/bg-\[\#22cc5e\]/g, 'bg-primary')
    .replace(/bg-\[\#0a1610\]/g, 'bg-surface-lowest');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
    count++;
  }
});

console.log('Updated ' + count + ' files.');
