const API_URL = 'http://localhost:5000/api/tasks';

async function verifyApi() {
    try {
        console.log('1. Fetching existing tasks...');
        const initialRes = await fetch(API_URL);
        const initialData = await initialRes.json();
        console.log(`   Status: ${initialRes.status}`);
        console.log(`   Count: ${initialData.length}`);

        console.log('\n2. Creating a new test task...');
        const newTask = {
            title: "Verification Task",
            description: "Auto-generated to verify backend connectivity",
            status: "pending"
        };
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (!createRes.ok) {
            throw new Error(`Failed to create task: ${createRes.statusText}`);
        }

        const createData = await createRes.json();
        console.log(`   Status: ${createRes.status}`);
        console.log(`   Created: ${createData.title} (ID: ${createData.id})`);

        console.log('\n3. Fetching tasks again...');
        const finalRes = await fetch(API_URL);
        const finalData = await finalRes.json();
        console.log(`   Status: ${finalRes.status}`);
        console.log(`   Count: ${finalData.length}`);

        const found = finalData.find(t => t.id === createData.id);
        if (found) {
            console.log('\nSUCCESS: Task created and retrieved successfully.');
        } else {
            console.error('\nFAILURE: Created task not found in list.');
        }

    } catch (error) {
        console.error('\nERROR:', error.message);
    }
}

verifyApi();
