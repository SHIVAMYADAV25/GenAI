// const vocabulary = {
//   "I": 1,
//   "am": 2,
//   "learning": 3,
//   "Next": 4,
//   ".": 5,
//   "js": 6,
//   "!": 7
// };

// function convertTokensToIds(tokens, vocab) {
//   return tokens.map(token => vocab[token] ?? 0); // 0 = unknown token
// }

// const tokens3 = subwordTokenizer("I am learning Next.js!");
// const tokenIds = convertTokensToIds(tokens3, vocabulary);

// console.log(tokens3);
// console.log(tokenIds);


// this is how it looks in under the hood

import {get_encoding} from "tiktoken";

const encoding = get_encoding("cl100k_base");
const token = encoding.encode("hello world this is testing prompt for counting token");
console.log(token);