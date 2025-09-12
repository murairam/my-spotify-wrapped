const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const path = require("path");
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

if (!process.env.GITHUB_TOKEN) {
  console.error("❌ GITHUB_TOKEN not found in .env.local");
  process.exit(1);
}

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function createIssues() {
  try {
    const recommendations = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../audit_recommendations.json'), 'utf8')
    );

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i];
      try {
        console.log(`Creating issue ${i+1}/${recommendations.length}: ${rec.title}`);
        const issue = await octokit.rest.issues.create({
          owner: "murairam",
          repo: "my-spotify-wrapped",
          title: rec.title,
          body: rec.body,
          labels: rec.labels,
          assignees: [rec.assignee],
        });
        console.log(`✅ Created issue: ${issue.data.title} (${issue.data.html_url})`);
      } catch (error) {
        console.error(`❌ Failed to create issue: ${rec.title}`);
        console.error(`Error: ${error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Failed to access repository:", error.message);
  }
}

createIssues();
