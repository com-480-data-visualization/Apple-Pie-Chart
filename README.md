### 1. Running the Frontend Locally

1. Navigate to the project folder:  
   ```bash
   cd website
   ```
2. Ensure Yarn is installed (e.g., on macOS):  
   ```bash
   brew install yarn
   yarn --version
   ```
3. Start the development server:  
   ```bash
   cd frontend/app
   yarn install
   yarn run dev
   ```
4. Open your browser at:  
   http://localhost:3000

### 2. After update on local, Building for Production

1. In the frontend folder, run the build command:  
   ```bash
   yarn build
   ```
   This will generate a static export (usually in the “out” folder if you have “output: 'export'” in next.config.mjs).

2. (Optional) If the build doesn’t automatically export to “out,” manually run:  
   ```bash
   yarn export
   ```
   You should see compiled static files in the “out” folder.

### 3. Updating GitHub Pages (docs Folder)

1. Move or copy the contents of “out” to the “docs” folder in the root of the “web” branch. For example:  
   ```bash
   rm -rf ../../../../docs/*
   cp -R out/* ../../../../docs/
   ```
   (Adjust paths to match your structure.)

2. Commit and push the updated “docs” folder to GitHub on the “web” branch:  
   ```bash
   git add docs
   git commit -m "Update docs for GitHub Pages"
   git push origin web
   ```
