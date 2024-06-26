# Node.js Express Login and Registration example with MongoDB and JWT

Create accounts, log in, and log out with this accounts system.

Forked from [another project](https://github.com/bezkoder/node-js-express-login-mongodb). Thank you Bezkoder!

### Summary of changes

-  Replace config folder containing two files with a `.env` file for simplicity
-  Update packages
-  Remove depreciated config options
-  Refactor Mongo functions that no longer accept callbacks
-  Add conditional port listening for easy deployment with Netlify

### Potential improvements

-  It's a bit too modular for my taste, and quite difficult to trace the path of imports and exports across the code base. Could potentially be simplified quite a lot unless your project is very complex
