import Airtable from 'airtable';

// Initialize Airtable instance securely
const apiKey = import.meta.env.VITE_AIRTABLE_ACCESS_TOKEN || import.meta.env.VITE_AIRTABLE_API_KEY || 'dummy_api_key_for_now';
const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID || 'dummy_base_id_for_now';

if (apiKey === 'dummy_api_key_for_now' || baseId === 'dummy_base_id_for_now') {
  console.warn('Airtable API Key or Base ID is missing! Using dummy credentials for UI development.');
}

const base = new Airtable({ apiKey }).base(baseId);

// Generic function to fetch records from a specific table
export const fetchRecords = async (tableName: string, view = 'Grid view') => {
  try {
    if (apiKey === 'dummy_api_key_for_now') return [];
    
    const records = await base(tableName).select({ view }).all();
    const formattedRecords = records.map(record => ({ id: record.id, ...record.fields }));
    console.log(`Airtable Response (${tableName}):`, formattedRecords);
    return formattedRecords;
  } catch (error) {
    console.error("Airtable Error:", error);
    throw error;
  }
};

// Global function to handle real-time PATCH requests
export const updateRecord = async (tableName: string, recordId: string, fields: Partial<any>) => {
  try {
    if (apiKey === 'dummy_api_key_for_now') {
      console.log(`Mock Update - Table: ${tableName}, ID: ${recordId}`, fields);
      return { id: recordId, ...fields };
    }

    const updatedRecords = await base(tableName).update([
      {
        id: recordId,
        fields: fields
      }
    ]);
    return { id: updatedRecords[0].id, ...updatedRecords[0].fields };
  } catch (error) {
    console.error(`Error updating record ${recordId} in ${tableName}:`, error);
    throw error;
  }
};

export const createRecord = async (tableName: string, fields: Partial<any>) => {
  try {
    if (apiKey === 'dummy_api_key_for_now') {
      console.log(`Mock Create - Table: ${tableName}`, fields);
      return { id: 'mock_' + Date.now(), ...fields };
    }

    const createdRecords = await base(tableName).create([
      { fields }
    ]);
    return { id: createdRecords[0].id, ...createdRecords[0].fields };
  } catch (error: any) {
    console.error("Airtable POST Error Details:", error.response?.data || error);
    throw error;
  }
};

export const deleteRecord = async (tableName: string, recordId: string) => {
  try {
    if (apiKey === 'dummy_api_key_for_now') {
      console.log(`Mock Delete - Table: ${tableName}, ID: ${recordId}`);
      return recordId;
    }

    await base(tableName).destroy([recordId]);
    return recordId;
  } catch (error: any) {
    console.error("Airtable DELETE Error Details:", error.response?.data || error);
    throw error;
  }
};

// Specialized fetchers
export const fetchFacilities = () => fetchRecords('Facilities & Clients');
export const fetchCandidates = () => fetchRecords('Clinicians & Candidates');
export const fetchPartners = () => fetchRecords('Recruiting Partners');
