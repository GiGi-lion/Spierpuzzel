<!DOCTYPE html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HAN-ALO Spierpuzzel</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      body {
        /* Fallback color */
        background-color: #7f1d1d; 
        /* The muscle image provided */
        background-image: url('https://images.nrc.nl/tqrylT9cHx5bkom3IxAw1EQxe0E=/1280x/filters:no_upscale()/s3/static.nrc.nl/images/stripped/web_2301zatwetspieren.jpg');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        background-repeat: no-repeat;
      }
      /* Add a dark overlay to ensure text contrast if image is too bright, though we use glass panels */
      body::before {
        content: "";
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(40, 0, 0, 0.4); /* Dark red tint overlay */
        z-index: -1;
      }
      
      body {
        overscroll-behavior-y: contain;
      }
    </style>
  <script type="importmap">
{
  "imports": {
    "react/": "https://esm.sh/react@^19.2.4/",
    "react": "https://esm.sh/react@^19.2.4",
    "lucide-react": "https://esm.sh/lucide-react@^0.563.0",
    "react-dom/": "https://esm.sh/react-dom@^19.2.4/",
    "canvas-confetti": "https://esm.sh/canvas-confetti@^1.9.4",
    "@dnd-kit/core": "https://esm.sh/@dnd-kit/core@^6.3.1",
    "@dnd-kit/sortable": "https://esm.sh/@dnd-kit/sortable@^10.0.0",
    "react-dom": "https://esm.sh/react-dom@^19.2.4"
  }
}
</script>
<link rel="stylesheet" href="/index.css">
</head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
  </body>
</html>