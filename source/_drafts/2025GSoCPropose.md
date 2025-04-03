---
title: '2025GSoC Propose: Batch Prediction with Gemini APIs'
date: 2025-04-02 12:58:34
cover: https://bu.dusays.com/2025/04/02/67ecc480e6d3e.jpg
---
## title
TBD

## Summary
This proposal outlines my plan to develop a Python-based code sample for batch prediction using Gemini APIs, focusing on long context handling and context caching to efficiently answer interconnected questions about a video. Leveraging my experience in Python, algorithms, and prior use of Gemini APIs, I aim to deliver a robust, well-documented solution within 175 hours.

## Keywords
Python, Agent, Algorithm, Prompt.

# Proposal

## Background
- **Name**: Zhu Kainian
- **Education**: Computer Science student at Shanghai University of Electric and Power
- **Skills**:
  - Algorithms/Data Structures: Silver Medal at ICPC Hangzhou Regional Contest, Codeforces ID: [Empty_Dust](https://codeforces.com/profile/Empty_Dust) (maxRating:2272).
  - Programming: Proficient in Python; basic experience with asynchronous programming (used in a personal Minecraft mod calling Gemini APIs).
  - GitHub: [EmptyDust](https://github.com/EmptyDust/).
  - Interests: Currently learning about AI agents: multi-agent collaboration, and prompt engineering.
- **Motivation**: I’m passionate about AI and open-source development. My prior use of Gemini APIs in a mod project sparked my interest in this project’s focus on efficient API usage for video analysis.

## Project Goals
- Implement batch prediction to minimize API calls for multiple questions.
- Handle long video transcripts using Gemini’s long context capabilities.
- Develop a caching system to reuse prior interactions, enhancing efficiency.
- Support interconnected questions with conversation history.
- Provide clear output with video timestamps and robust error handling.

### Baseline
1. Chatdev 长短期记忆
2. 纪录片：通过文本分析 
3. 节标题分段：节标题单独成帧/字幕分析
4. 字幕影响：可怜的兔子被吃掉了/豹子勇猛的吃掉兔子  
5. 标题：《宋浩在讲高等数学》-> 不管爱情故事
6. 高等数学/工科 黑板板书 板书很糊/语音很糊->视频内容反推来源获取信息
7. 字幕和语音不匹配 -> 自我纠错
8. 上课内容和QA

## Approach
1. **Setup (Week 1, 10 hours)**:
   - Study Gemini API documentation and setup environment with API key.
   - Prepare a sample video transcript for testing.
2. **Batch Prediction (Weeks 2-3, 20 hours)**:
   - Design a function to group questions into batches, optimizing API call limits.
   - Use Python’s `asyncio` for asynchronous batch processing.
3. **Long Context Handling (Weeks 4-5, 25 hours)**:
   - Segment transcripts exceeding context limits into chunks.
   - Test chunking strategies to maintain coherence.
4. **Context Caching (Weeks 6-7, 25 hours)**:
   - Implement an in-memory cache (e.g., using `dict`) to store prior API responses.
   - Add cache invalidation logic for updated questions.
5. **Interconnected Questions & Output (Weeks 8-9, 25 hours)**:
   - Maintain a conversation history object to link questions.
   - Format outputs with timestamps using a structured JSON response.
6. **Error Handling & Documentation (Weeks 10-11, 20 hours)**:
   - Add try-except blocks for API/network errors with retries.
   - Write detailed comments and a README with setup/use instructions.
7. **Testing & Refinement (Week 12, 20 hours)**:
   - Test with diverse question sets and video lengths.
   - Refine based on performance and feedback.

## Timeline
- **Total**: 175 hours over 12 weeks (June 2 - August 25, 2025).
- **Weekly Commitment**: ~15 hours, adjustable for exams or holidays.

## Deliverables
- A Python script with batch prediction, long context support, and caching.
- Comprehensive documentation and example usage with a sample video.
- Test cases covering success and error scenarios.

## Why Me?
My ICPC award and Codeforces experience show my algorithmic strength, crucial for optimizing batch processing and caching. My Python skills and prior Gemini API use (albeit basic) give me a head start. I’m eager to deepen my asynchronous programming knowledge and contribute to Google DeepMind’s open-source efforts.

## Additional Notes
- I’ll engage with the community via Google DeepMind’s public channels for feedback.
- I’m open to mentor suggestions and will submit early drafts for review.


