export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, name, subject, message } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Mailchimp credentials (from environment or hardcoded for now)
  const API_KEY = '83d871bd01bd56d17f23c7a1000d51d2-us18';
  const LIST_ID = '0fdc19f24f';
  const SERVER_PREFIX = 'us18';

  try {
    // Prepare subscriber data
    const subscriberData = {
      email_address: email,
      status: 'pending', // Double opt-in
      merge_fields: {
        FNAME: name || '',
      },
    };

    // If this is a contact form submission, add subject and message as notes
    if (subject || message) {
      subscriberData.merge_fields.SUBJECT = subject || '';
      subscriberData.merge_fields.MESSAGE = message || '';
    }

    // Make request to Mailchimp API
    const response = await fetch(
      `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`anystring:${API_KEY}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscriberData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      // Handle already subscribed case
      if (data.status === 400 && data.title === 'Member Exists') {
        return res.status(200).json({ 
          success: true, 
          message: 'Already subscribed!' 
        });
      }
      throw new Error(data.detail || 'Mailchimp API error');
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Successfully added to our list!' 
    });
  } catch (error) {
    console.error('Mailchimp error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to subscribe' 
    });
  }
}
