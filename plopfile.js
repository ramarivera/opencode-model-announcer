import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function (plop) {
  // Get the current git remote URL
  let remoteUrl = "";
  try {
    remoteUrl = execSync("git config --get remote.origin.url", {
      cwd: __dirname,
      encoding: "utf-8",
    }).trim();
  } catch {
    remoteUrl = "";
  }

  plop.setHelper("kebabCase", (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  );

  plop.setGenerator("plugin", {
    description: "Generate a new OpenCode plugin",
    prompts: [
      {
        type: "input",
        name: "pluginName",
        message: "Plugin name (e.g., my-awesome-plugin)",
        default: "my-opencode-plugin",
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return "Plugin name cannot be empty";
          }
          if (!/^[a-z0-9-]+$/.test(input)) {
            return "Plugin name must contain only lowercase letters, numbers, and hyphens";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Plugin description",
        default: "An OpenCode plugin",
      },
      {
        type: "input",
        name: "authorName",
        message: "Author name",
        default: "Your Name",
      },
      {
        type: "input",
        name: "authorEmail",
        message: "Author email",
        default: "you@example.com",
      },
      {
        type: "input",
        name: "repositoryUrl",
        message: "Repository URL (for package.json)",
        default: remoteUrl || "https://github.com/username/my-opencode-plugin",
      },
      {
        type: "input",
        name: "githubOrg",
        message: "GitHub organization/username (for workflows)",
        default: "username",
      },
    ],
    actions: [
      // Copy all template files with variable substitution
      {
        type: "addMany",
        templateFiles: "template/**/*",
        base: "template",
        destination: "{{cwd}}",
        globOptions: {
          dot: true,
          ignore: ["template/node_modules/**", "template/.git/**"],
        },
      },
      // Custom action to handle git cleanup and reinitialization
      {
        type: "exec",
        command: (answers) => {
          const script = generateCleanupScript(answers);
          return script;
        },
        description:
          "Cleaning up generator files and reinitializing git repository",
      },
    ],
  });

  function generateCleanupScript(answers) {
    // Create a Node script that will run the cleanup
    const scriptPath = path.join(__dirname, ".cleanup.js");

    const cleanupScript = `
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

try {
  console.log('🧹 Cleaning up generator files...');
  
  // Rename current branch to 'template'
  try {
    execSync('git branch -m template', { cwd: __dirname, stdio: 'pipe' });
    console.log('✓ Renamed branch to template');
  } catch (e) {
    console.log('ℹ️  Branch already named template or git issue, continuing...');
  }

  // Store the remote URL in package.json
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  pkg.repository = {
    type: 'git',
    url: '${answers.repositoryUrl}',
  };
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\\n');
  console.log('✓ Updated repository URL in package.json');

  // Remove generator files and directories
  const itemsToRemove = ['template', 'plopfile.js', '.cleanup.js'];
  for (const item of itemsToRemove) {
    const itemPath = path.join(__dirname, item);
    if (fs.existsSync(itemPath)) {
      if (fs.statSync(itemPath).isDirectory()) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(itemPath);
      }
      console.log(\`✓ Removed \${item}\`);
    }
  }

  // Remove old .git directory
  const gitPath = path.join(__dirname, '.git');
  if (fs.existsSync(gitPath)) {
    fs.rmSync(gitPath, { recursive: true, force: true });
    console.log('✓ Removed old .git directory');
  }

  // Initialize new git repository
  console.log('🚀 Initializing new git repository...');
  execSync('git init -b main', { cwd: __dirname, stdio: 'pipe' });
  console.log('✓ Created new git repository with main branch');

  // Add all files
  execSync('git add .', { cwd: __dirname, stdio: 'pipe' });
  console.log('✓ Staged all files');

  // Create initial commit
  const commitMessage = 'chore: initialize {{pluginName}} from opencode plugin template';
  execSync(\`git commit -m "\${commitMessage}"\`, { cwd: __dirname, stdio: 'pipe' });
  console.log('✓ Created initial commit');

  // Add remote
  try {
    execSync(\`git remote add origin ${answers.repositoryUrl}\`, { cwd: __dirname, stdio: 'pipe' });
    console.log('✓ Added remote origin');
  } catch (e) {
    // Remote may already exist, ignore
  }

  // Try to push (may fail if repo doesn't exist yet, that's ok)
  try {
    execSync('git push -u origin main', { cwd: __dirname, stdio: 'pipe' });
    console.log('✓ Pushed to remote');
  } catch (e) {
    console.log('ℹ️  Could not push to remote (repository may not exist yet)');
    console.log('   Run this manually when ready: git push -u origin main');
  }

  console.log('');
  console.log('✨ Plugin generated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review package.json and update name/version as needed');
  console.log('  2. Update README.md with your plugin details');
  console.log('  3. Implement your plugin in src/');
  console.log('  4. Run: bun install');
  console.log('  5. Run: mise run build');
  console.log('');
} catch (error) {
  console.error('❌ Error during cleanup:', error.message);
  process.exit(1);
}
`;

    fs.writeFileSync(scriptPath, cleanupScript);

    // Return command to execute the cleanup script
    return `node ${scriptPath}`;
  }
}
