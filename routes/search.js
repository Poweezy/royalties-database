// Search API Routes
const express = require('express');
const router = express.Router();

// Search across all entities
router.get('/api/search', async (req, res) => {
    try {
        const { query, entities = 'contracts,users,activities' } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                error: 'Search query must be at least 2 characters long'
            });
        }

        const entityList = entities.split(',');
        const results = await performSearch(query, entityList);

        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Perform search across specified entities
async function performSearch(query, entities) {
    const searchPromises = entities.map(entity => {
        switch (entity) {
            case 'contracts':
                return searchContracts(query);
            case 'users':
                return searchUsers(query);
            case 'activities':
                return searchActivities(query);
            default:
                return Promise.resolve([]);
        }
    });

    const results = await Promise.all(searchPromises);
    return results.flat().sort((a, b) => b.relevance - a.relevance);
}

// Search within contracts
async function searchContracts(query) {
    try {
        const contracts = await db.collection('contracts').find({
            $or: [
                { entity: { $regex: query, $options: 'i' } },
                { type: { $regex: query, $options: 'i' } },
                { status: { $regex: query, $options: 'i' } },
                { notes: { $regex: query, $options: 'i' } }
            ]
        }).toArray();

        return contracts.map(contract => ({
            id: contract._id,
            entity: 'contracts',
            title: `${contract.entity} - ${contract.type}`,
            subtitle: `Valid: ${formatDate(contract.startDate)} - ${formatDate(contract.endDate)}`,
            status: contract.status,
            relevance: calculateRelevance(query, contract),
            data: contract
        }));
    } catch (error) {
        console.error('Error searching contracts:', error);
        return [];
    }
}

// Search within users
async function searchUsers(query) {
    try {
        const users = await db.collection('users').find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { role: { $regex: query, $options: 'i' } },
                { department: { $regex: query, $options: 'i' } }
            ]
        }).toArray();

        return users.map(user => ({
            id: user._id,
            entity: 'users',
            title: `${user.firstName} ${user.lastName}`,
            subtitle: `${user.email} - ${user.role}`,
            status: user.status,
            relevance: calculateRelevance(query, user),
            data: user
        }));
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
}

// Search within activities
async function searchActivities(query) {
    try {
        const activities = await db.collection('activities').find({
            $or: [
                { description: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } },
                { details: { $regex: query, $options: 'i' } }
            ]
        }).toArray();

        return activities.map(activity => ({
            id: activity._id,
            entity: 'activities',
            title: activity.description,
            subtitle: `${activity.category} - ${formatDate(activity.timestamp)}`,
            status: activity.status,
            relevance: calculateRelevance(query, activity),
            data: activity
        }));
    } catch (error) {
        console.error('Error searching activities:', error);
        return [];
    }
}

// Calculate search result relevance
function calculateRelevance(query, item) {
    let relevance = 0;
    const searchableFields = {
        contracts: {
            entity: 3,
            type: 2,
            status: 1,
            notes: 1
        },
        users: {
            username: 3,
            email: 2,
            firstName: 2,
            lastName: 2,
            role: 1,
            department: 1
        },
        activities: {
            description: 3,
            category: 2,
            details: 1
        }
    };

    // Calculate field-specific relevance
    const itemType = item.entity || (item.username ? 'users' : item.description ? 'activities' : 'contracts');
    const fields = searchableFields[itemType];

    Object.entries(fields).forEach(([field, weight]) => {
        if (item[field] && typeof item[field] === 'string') {
            const value = item[field].toLowerCase();
            const queryLower = query.toLowerCase();

            // Exact match
            if (value === queryLower) {
                relevance += weight * 3;
            }
            // Starts with query
            else if (value.startsWith(queryLower)) {
                relevance += weight * 2;
            }
            // Contains query
            else if (value.includes(queryLower)) {
                relevance += weight;
            }
        }
    });

    // Time-based relevance for activities
    if (itemType === 'activities' && item.timestamp) {
        const age = Date.now() - new Date(item.timestamp).getTime();
        const dayInMs = 24 * 60 * 60 * 1000;
        if (age < dayInMs) { // Last 24 hours
            relevance += 3;
        } else if (age < 7 * dayInMs) { // Last week
            relevance += 2;
        } else if (age < 30 * dayInMs) { // Last month
            relevance += 1;
        }
    }

    return relevance;
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

module.exports = router;
