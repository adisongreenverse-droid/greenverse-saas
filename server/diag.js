require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const axios = require('axios');

async function check() {
  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(1);
  const lastPost = posts[0];
  console.log("Last Post ID:", lastPost?.id);
  console.log("Image URL:", lastPost?.image_url);

  // Check the user credentials
  if (lastPost && lastPost.user_id) {
    const { data: user } = await supabase.from('users').select('*').eq('id', lastPost.user_id).single();
    console.log("User Facebook Page ID:", user?.facebook_page_id);
    console.log("Token starts with:", user?.facebook_access_token ? user.facebook_access_token.substring(0, 15) + '...' : 'NULL');
    
    if (user?.facebook_page_id && user?.facebook_access_token) {
      try {
        const igAccRes = await axios.get(`https://graph.facebook.com/v19.0/${user.facebook_page_id}?fields=instagram_business_account&access_token=${user.facebook_access_token}`);
        console.log("Instagram Linked:", JSON.stringify(igAccRes.data));
      } catch (err) {
        console.log("IG Check Error:", err.message);
      }
    }
  }
}
check();
