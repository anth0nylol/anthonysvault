# AnthonysVault — GitHub Pages website

Ready-to-upload static website, exported from the approved version 7 on September 17, 2026.

## 1. Create the repository

Use your personal GitHub account to create `anthonysvault-website`. Public repositories support Pages on GitHub Free; private repositories require a plan that supports Pages for private repositories.

Extract the ZIP and upload its contents into the repository root. Upload the extracted files and `assets` folder, not the ZIP itself or an extra enclosing folder. `index.html` must be directly at the repository root.

Included files: the published website, filtered public replay, media assets, `CNAME` containing `anthonysvault.com`, and `.nojekyll`. No private research source, native study source, credentials, or existing Git history is included.

## 2. Enable GitHub Pages

Open the repository's **Settings → Pages**:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**
- Save.

Under **Custom domain**, enter `anthonysvault.com` and save. The included CNAME file already contains this address; confirm the setting in Pages before editing DNS. Wait for the Pages deployment to finish; its status is visible in Actions.

## 3. Connect Namecheap

Keep **Namecheap BasicDNS** as the domain's nameserver setting for these instructions. If you already use another DNS provider, edit these records at that provider instead.

Open **Domain List → Manage** beside `anthonysvault.com` → **Advanced DNS → Host Records**. Add these records, using Automatic TTL:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | YOUR-GITHUB-USERNAME.github.io |

Replace `YOUR-GITHUB-USERNAME` with your actual personal account username. The CNAME value has no `https://`, repository name, or path.

Replace conflicting parking/URL Redirect/A/AAAA/CNAME records for `@` or `www`; retain unrelated email and verification records. Save all changes. This connects the custom domain to the hosted site; the Namecheap URL Redirect field is not needed.

## 4. Turn on HTTPS and check

Return to **GitHub repository → Settings → Pages**. Wait for the DNS check and certificate, then enable **Enforce HTTPS**. DNS changes may take up to 24 hours; certificate provisioning can also take time.

Open `https://anthonysvault.com` and `https://www.anthonysvault.com`. With both hosts correctly configured and `anthonysvault.com` as the custom domain, the www address redirects to the root domain.

Check the trailer, chapter links, replay toggles, phone layout, and Memberful checkout before announcing the new URL.

Optional domain ownership verification is under your personal GitHub account's **Settings → Pages → Add a domain**. GitHub supplies a TXT record to add at Namecheap; keep it after verification.

## Future updates

Commit updated public website files to `main`; GitHub Pages republishes. Keep `CNAME` and `.nojekyll`. Changes to the existing ChatGPT-hosted copy do not automatically update this separate repository.

This package is the public website only. Next work is the organized member Research Workspace and Discord integration, then full release and TikTok promotion on @nasdaqant. The member service needs its own server hosting because its access checks run on the server.

## Official references

- Publishing source: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Namecheap setup: https://www.namecheap.com/support/knowledgebase/article.aspx/9645/2208/how-do-i-link-my-domain-to-github-pages/
- HTTPS: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
- Custom domains: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages
