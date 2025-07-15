// This script will help you find the Google Form entry IDs
// Run this in the browser console on your Google Form preview page

function findGoogleFormEntryIds() {
    console.log('🔍 Searching for Google Form entry IDs...\n');
    
    // Method 1: Look for input elements with entry names
    const inputs = document.querySelectorAll('input[name*="entry."], textarea[name*="entry."]');
    
    if (inputs.length > 0) {
        console.log('✅ Found entry IDs in input elements:');
        inputs.forEach((input, index) => {
            const entryId = input.name;
            const label = input.getAttribute('aria-label') || input.getAttribute('data-initial-value') || 'Unknown field';
            console.log(`${index + 1}. ${entryId} - ${label}`);
        });
    } else {
        console.log('❌ No entry IDs found in input elements');
    }
    
    // Method 2: Look in the page source
    const pageSource = document.documentElement.outerHTML;
    const entryMatches = pageSource.match(/entry\.\d+/g);
    
    if (entryMatches && entryMatches.length > 0) {
        console.log('\n✅ Found entry IDs in page source:');
        const uniqueEntries = [...new Set(entryMatches)];
        uniqueEntries.forEach((entry, index) => {
            console.log(`${index + 1}. ${entry}`);
        });
    } else {
        console.log('\n❌ No entry IDs found in page source');
    }
    
    // Method 3: Look for form data
    const form = document.querySelector('form');
    if (form) {
        console.log('\n✅ Form found, checking for data attributes...');
        const formData = new FormData(form);
        for (let [key, value] of formData.entries()) {
            if (key.startsWith('entry.')) {
                console.log(`Found: ${key}`);
            }
        }
    }
    
    console.log('\n📋 Instructions:');
    console.log('1. Copy the entry IDs from above');
    console.log('2. Replace the placeholder IDs in your Contact.tsx file');
    console.log('3. Match each entry ID to the correct field (Name, Email, Phone, Subject, Message)');
}

// Run the function
findGoogleFormEntryIds();

// Alternative: If the above doesn't work, try this method
console.log('\n🔄 Alternative method:');
console.log('1. Fill out the form manually');
console.log('2. Open Network tab in DevTools');
console.log('3. Submit the form');
console.log('4. Look for the formResponse request');
console.log('5. Check the request payload for entry IDs');
