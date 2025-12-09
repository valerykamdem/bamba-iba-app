// Test script pour tester les appels API directement
const axios = require('axios');

const testAPI = async () => {
    console.log('🧪 Testing API endpoints...\n');

    try {
        // Test videos
        console.log('📹 Testing videos endpoint...');
        const videosResponse = await axios.get('http://localhost:7000/api/videos', {
            params: {
                Page: 1,
                PageSize: 2,
                Genre: '',
                Search: ''
            }
        });
        console.log('✅ Videos response:', JSON.stringify(videosResponse.data, null, 2));

        // Test audios
        console.log('\n🎵 Testing audios endpoint...');
        const audiosResponse = await axios.get('http://localhost:7000/api/audios', {
            params: {
                Page: 1,
                PageSize: 2,
                Genre: '',
                Search: ''
            }
        });
        console.log('✅ Audios response:', JSON.stringify(audiosResponse.data, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
    }
};

testAPI();
