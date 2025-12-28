// let lastResponseId : string | null = ""
//conversationId -> lastResponseId
// conv1 -> 100
// conv2 -> 200

export type Message = {
    role : "system" | "user" | "assistant";
    content: string;
}

// Implementation details  => keep this private
const conversations = new Map<string, Message[]>();


// Export public interfaces  => can be public

export const conversationRepository = {
    getLastResponseId(conversationId : string){
        return conversations.get(conversationId) ?? []
    },
 
    setLastResponseId(conversationId : string,message : Message){
        const history = conversations.get(conversationId) ?? [];
        history.push(message)
        return conversations.set(conversationId, history);
    }

}


