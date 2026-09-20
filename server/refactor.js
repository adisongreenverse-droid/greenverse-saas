const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');

const executePostFunc = `
// The actual posting execution logic
async function executePost(postRecord) {
  const { message, posttype: postType, platforms, image_url, scheduled_publish_time } = postRecord;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  let isMockMode = false;
  let validation = { valid: false };

  if (!pageId || !accessToken) {
    isMockMode = true;
  } else {
    validation = await validatePageToken(accessToken, pageId);
    if (!validation.valid) isMockMode = true;
  }

  if (isMockMode) {
    console.log("Running in MOCK MODE for execution.");
    let mockResults = {};
    platforms.forEach(p => mockResults[p] = { success: true, mock: true });
    return mockResults;
  }

  const pageConfigs = [
    { id: process.env.FACEBOOK_PAGE_ID, token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN, name: 'DTF Printing' }
  ];
  if (process.env.FACEBOOK_PAGE_ID_ADISON && process.env.FACEBOOK_PAGE_ACCESS_TOKEN_ADISON) {
    pageConfigs.push({
      id: process.env.FACEBOOK_PAGE_ID_ADISON,
      token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN_ADISON,
      name: 'Adison'
    });
  }

  let results = {};
  results.instagram = [];
  results.facebook = [];
  
  let tempFilePath = null;
  if (image_url) {
    const isLocalUrl = image_url.startsWith('/uploads');
    if (isLocalUrl) {
      tempFilePath = require('path').join(__dirname, 'public', image_url);
    } else {
      try {
        const response = await axios.get(image_url, { responseType: 'stream' });
        tempFilePath = require('path').join(__dirname, 'uploads', \`temp_\${Date.now()}.jpg\`);
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
      } catch (e) {
        console.error("Failed to download image for execution:", e.message);
      }
    }
  }

  let publicMediaUrl = image_url; 

  if (platforms.includes('instagram')) {
    for (const config of pageConfigs) {
      try {
        const igAccRes = await axios.get(\`https://graph.facebook.com/v19.0/\${config.id}?fields=instagram_business_account&access_token=\${config.token}\`);
        const igAccountId = igAccRes.data.instagram_business_account?.id;
        if (!igAccountId) {
          results.instagram.push({ name: config.name, success: false, error: 'No IG account linked' });
          continue;
        }

        if (postType === 'image' && publicMediaUrl) {
          const igMediaPayload = {
            image_url: publicMediaUrl,
            caption: message || '',
            access_token: config.token
          };
          const mediaRes = await axios.post(\`https://graph.facebook.com/v19.0/\${igAccountId}/media\`, igMediaPayload);
          const creationId = mediaRes.data.id;
          const publishRes = await axios.post(\`https://graph.facebook.com/v19.0/\${igAccountId}/media_publish\`, {
            creation_id: creationId,
            access_token: config.token
          });
          results.instagram.push({ name: config.name, success: true, id: publishRes.data.id });
        } else if (postType === 'video' && tempFilePath) {
          const igMediaPayload = {
            media_type: 'REELS',
            video_url: publicMediaUrl,
            caption: message || '',
            access_token: config.token
          };
          const mediaRes = await axios.post(\`https://graph.facebook.com/v19.0/\${igAccountId}/media\`, igMediaPayload);
          const creationId = mediaRes.data.id;
          const publishRes = await axios.post(\`https://graph.facebook.com/v19.0/\${igAccountId}/media_publish\`, {
            creation_id: creationId,
            access_token: config.token
          });
          results.instagram.push({ name: config.name, success: true, id: publishRes.data.id });
        }
      } catch (err) {
        console.log(\`- Instagram error for \${config.name}:\`, err.response?.data || err.message);
        results.instagram.push({ name: config.name, success: false, error: err.message });
      }
    }
  }

  if (platforms.includes('facebook')) {
    for (const config of pageConfigs) {
      try {
        let fbRes;
        if (postType === 'text') {
          const payload = { message: message, access_token: config.token };
          fbRes = await axios.post(\`https://graph.facebook.com/v19.0/\${config.id}/feed\`, payload);
        } else if (postType === 'image' && publicMediaUrl) {
          fbRes = await axios.post(\`https://graph.facebook.com/v19.0/\${config.id}/photos\`, {
            message: message || '',
            access_token: config.token,
            url: publicMediaUrl,
            published: true
          });
        } else if (postType === 'video' && tempFilePath) {
          const formData = new FormData();
          formData.append('description', message || '');
          formData.append('access_token', config.token);
          formData.append('published', 'true');
          formData.append('source', fs.createReadStream(tempFilePath));
          fbRes = await axios.post(\`https://graph.facebook.com/v19.0/\${config.id}/videos\`, formData, {
            headers: { ...formData.getHeaders() }
          });
        }
        if (fbRes) results.facebook.push({ name: config.name, success: true, data: fbRes.data });
      } catch (err) {
        console.log(\`- Facebook error for \${config.name}:\`, err.response?.data || err.message);
        results.facebook.push({ name: config.name, success: false, error: err.message });
      }
    }
  }

  if (tempFilePath && !tempFilePath.startsWith(require('path').join(__dirname, 'public'))) {
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }

  return results;
}
`;

const newPostEndpoint = `app.post('/api/post/social', upload.any(), async (req, res) => {
  try {
    const { message, scheduled_publish_time, postType = 'image' } = req.body;
    let platforms = [];
    try { platforms = JSON.parse(req.body.platforms || '[]'); } catch (e) { platforms = ['facebook']; }

    const file = req.files && req.files.length > 0 ? req.files[0] : null;
    let finalLocalImageUrl = null;

    if (file) {
      finalLocalImageUrl = await uploadToSupabase(file);
      if (!finalLocalImageUrl) {
        const extension = file.originalname.split('.').pop() || 'jpg';
        const newFilename = \`thumb_\${Date.now()}.\${extension}\`;
        const newPath = \`public/uploads/\${newFilename}\`;
        fs.copyFileSync(file.path, newPath);
        finalLocalImageUrl = \`/uploads/\${newFilename}\`;
      }
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }

    const postRecord = {
      id: Date.now().toString(),
      message: message || '',
      posttype: postType,
      platforms: platforms,
      image_url: finalLocalImageUrl || null,
      created_at: new Date().toISOString(),
      scheduled_publish_time: scheduled_publish_time ? parseInt(scheduled_publish_time, 10) : null,
      status: scheduled_publish_time ? 'pending' : 'published'
    };

    await savePost(postRecord);

    if (!scheduled_publish_time) {
      const results = await executePost(postRecord);
      return res.json({ success: true, results, diagnostic: { mode: 'immediate' } });
    }

    res.json({ success: true, results: { message: "Scheduled successfully" }, diagnostic: { mode: 'scheduled' } });

  } catch (error) {
    if (req.files) req.files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to post' });
  }
});`;

const newCronLogic = `
const cron = require('node-cron');
cron.schedule('* * * * *', async () => {
  if (!supabase) return;
  try {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const { data: pendingPosts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_publish_time', nowTimestamp);
      
    if (error) {
      console.error("Cron fetch error:", error);
      return;
    }
    
    for (const post of pendingPosts) {
      console.log(\`Running scheduled post: \${post.id}\`);
      await executePost(post);
      await supabase.from('posts').update({ status: 'published' }).eq('id', post.id);
    }
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});
`;

const startIndex = code.indexOf("app.post('/api/post/social',");
let blockToEnd = code.substring(startIndex);
let balance = 0;
let realEndIndex = -1;
for (let i = 0; i < blockToEnd.length; i++) {
  if (blockToEnd[i] === '{') balance++;
  if (blockToEnd[i] === '}') {
    balance--;
    if (balance === 0 && blockToEnd.substr(i+1, 2) === ');') {
      realEndIndex = startIndex + i + 3;
      break;
    }
  }
}

if (realEndIndex !== -1) {
  code = code.substring(0, startIndex) + executePostFunc + '\n\n' + newPostEndpoint + '\n\n' + code.substring(realEndIndex);
  code = code.replace("setInterval(() => {}, 1000 * 60 * 60);", newCronLogic);
  fs.writeFileSync('server.js', code);
  console.log("Refactored successfully");
} else {
  console.log("Could not find end of post endpoint");
}
