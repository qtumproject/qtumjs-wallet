
Build bundle:

```
yarn run browserify index.js --standalone QtumWallet -o bundle.js
```

Server index.html:

```
python3 -m http.server 8000
```

Open http://127.0.0.1/8000