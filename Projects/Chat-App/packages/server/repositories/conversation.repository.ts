// let lastResponseId : string | null = ""
//conversationId -> lastResponseId
// conv1 -> 100
// conv2 -> 200

// Implementation details  => keep this private
const conversations = new Map<string, string>();


// Export public interfaces  => can be public

export const conversationRepository = {
    getLastResponseId(conversationId : string){
        return conversations.get(conversationId)
    },

    setLastResponseId(conversationId : string,responseId : string){
        return conversations.set(conversationId, responseId);
    }

}


