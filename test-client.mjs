// Test pour vérifier que l'URL de l'API est correcte
import { apiClient } from './src/lib/api/client';

console.log('Testing API client configuration...');
console.log('baseURL:', apiClient.defaults.baseURL);

// Test direct avec axios
const axios = require('axios');

async function testEndpoints() {
    console.log('\n=== Test 1: Direct axios call ===');
    try {
        const response1 = await axios.get('http://localhost:7000/api/audios', {
            params: { Page: 1, PageSize: 2, Genre: '', Search: '' }
        });
        console.log('✅ Direct call successful:', response1.data.items.length, 'items');
    } catch (error) {
        console.error('❌ Direct call failed:', error.message);
    }

    console.log('\n=== Test 2: Using apiClient ===');
    try {
        const response2 = await apiClient.get('/audios', {
            params: { Page: 1, PageSize: 2, Genre: '', Search: '' }
        });
        console.log('✅ apiClient call successful:', response2.data.items.length, 'items');
    } catch (error) {
        console.error('❌ apiClient call failed:', error.message);
        if (error.config) {
            console.error('   URL attempted:', error.config.baseURL + error.config.url);
        }
    }

    console.log('\n=== Test 3: Videos endpoint ===');
    try {
        const response3 = await apiClient.get('/videos', {
            params: { Page: 1, PageSize: 2, Genre: '', Search: '' }
        });
        console.log('✅ Videos call successful:', response3.data.items.length, 'items');
    } catch (error) {
        console.error('❌ Videos call failed:', error.message);
        if (error.config) {
            console.error('   URL attempted:', error.config.baseURL + error.config.url);
        }
    }
}

testEndpoints();
