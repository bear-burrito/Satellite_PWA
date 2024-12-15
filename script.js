async function generateImage() {
    const inputText = document.getElementById('inputText').value;

    // Fetch the secrets injected by GitHub Actions
    const env = window._env_ || { CLIENT_ID: '', CLIENT_SECRET: '' };
    const CLIENT_ID = env.CLIENT_ID;
    const CLIENT_SECRET = env.CLIENT_SECRET;

    // Sentinel Hub API details
    const TOKEN_URL = 'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';
    const PROCESS_URL = 'https://sh.dataspace.copernicus.eu/api/v1/process';

    // Fetch OAuth token
    const tokenResponse = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Request parameters for Sentinel Hub
    const requestPayload = {
        input: {
            bounds: {
                bbox: [15.461282, 46.757161, 15.574922, 46.851514]
            },
            data: [
                {
                    type: 'S2L2A',
                    dataFilter: {
                        timeRange: {
                            from: '2022-07-01T00:00:00Z',
                            to: '2022-07-20T23:59:59Z'
                        }
                    }
                }
            ]
        },
        output: {
            width: 512,
            height: 512,
            responses: [
                { identifier: 'default', format: { type: 'image/png' } }
            ]
        }
    };

    // Make the API request
    const response = await fetch(PROCESS_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
    });

    // Handle the image response
    if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        displayImage(url);
    } else {
        console.error('Error fetching the image:', response.statusText);
    }
}

function displayImage(imageUrl) {
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.onload = function() {
        canvas.width = image.width;
        canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        canvas.style.display = 'block';
    };
    image.src = imageUrl;
}
