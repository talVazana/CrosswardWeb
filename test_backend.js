const fs = require('fs');

async function test() {
  const url = 'https://crossword-parser.onrender.com/parse-crossword';
  try {
    const formData = new FormData();
    const filePath = 'C:/CrossWord/oldStuff/bbb/a.jpg';
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'a.jpg');
    } else {
      console.log("File not found, sending dummy");
      formData.append('file', new Blob(['test'], { type: 'image/jpeg' }), 'test.jpg');
    }
    
    console.log("Sending to", url);
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });
    console.log(res.status, res.statusText);
    const text = await res.text();
    console.log("Response:", text.substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
