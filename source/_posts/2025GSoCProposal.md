---
title: '2025GSoC Proposal: Efficient Video Content Analysis via Batch Prediction and Context Caching with Gemini APIs'
date: 2025-04-02 12:58:34
cover: https://bu.dusays.com/2025/04/02/67ecc480e6d3e.jpg
---


<!-- ### My Idea
1. Chatdev 长短期记忆
2. 纪录片：通过文本分析 
3. 节标题分段：节标题单独成帧/字幕分析
4. 字幕影响：可怜的兔子被吃掉了/豹子勇猛的吃掉兔子  
5. 标题：《宋浩在讲高等数学》-> 不管爱情故事
6. 高等数学/工科 黑板板书 板书很糊/语音很糊->视频内容反推来源获取信息
7. 字幕和语音不匹配 -> 自我纠错
8. 上课内容和QA -->

<!-- # Title
Efficient Video Content Analysis via Batch Prediction and Context Caching with Gemini APIs

# Summary
This project addresses the challenge of efficiently analyzing long-form video content using Gemini APIs. I will develop a Python-based tool that leverages batch prediction, long-context handling, and context caching to accurately answer interconnected questions about video lectures and documentaries. The solution will process video transcripts, intelligently cache relevant context, and link answers to specific timestamps, enabling seamless navigation of complex educational material. Key deliverables include a robust preprocessing module, an optimized batch prediction pipeline, a context caching system, and well-documented code released on GitHub, along with a demo video.

# Project Technologies
Python, Gemini API, Asyncio, CacheTools, TextSplitter, JSON, Regular Expressions

# Project Topics
Machine Learning, Video Analysis, Asynchronous Programming, Long Context Handling -->

# Proposal

## Project Abstract & Motivation
The goal of this project is to offer a sample for process logical video with gemini API.
In today's fast-paced environment, dedicating 20-30 hours or more to studying a lecture or documentary is challenging. Therefore, supplementing our learning with specific questions posed to an AI model like Gemini would be highly efficient.

## Measures
1. Given the strong logical structure and rich textual content of our target videos, we can begin by extracting and processing the audio and subtitles. A key challenge is addressing discrepancies between the audio and subtitle content.
2. To efficiently handle batch prediction, we can first cluster the questions. This allows us to rearrange and combine them into a single query for the Gemini API, potentially expanding the breadth of its reasoning. We can then segment the videos by topic, ensuring that each question is only posed in the relevant video segment.
3. Subtitles are crucial. The seemingly small difference between 'A strong tiger kills a rabbit' and 'A rabbit killed pathetically by a tiger' dramatically alters the interpretation. The former might be from 'The Lion King,' while the latter could be from a video about the 'Benefits of Living in a Group.'
4. The video's background context is also crucial. Knowing that a lecture's speaker is 'Songhao' strongly suggests the topic is Calculus, not a love story. Therefore, the emphasis should be on mathematical concepts rather than romantic narratives.
5. In today's age of AI agents, we can significantly enhance our output by leveraging external tools like website researching. For example, actively consulting the '[Dive into Deep Learning](https://d2l.ai/)' textbook while listening to the Stanford [CS329P](https://c.d2l.ai/stanford-cs329p/) lecture series can be highly effective.
6. Given the distinct content of lessons and Q&A sessions, student questions and answers may sometimes be erroneous or irrelevant. If necessary, we may need to differentiate between the voices of the instructor and the students.
7. Since videos are generally continuous, with high similarity between adjacent frames, we can distribute the video processing across five or more parallel processes. These processes can then be synchronized at regular intervals, such as every minute of video time.

---

## **Timeline**
**Total Hours**: ~175 hours (about 12-13 hours/week)

#### **Phase 1: Transcript Preprocessing & Context Segmentation (Weeks 1–4)**
- **Week 1: Requirements & Tool Setup**
    - Analyze video transcript formats (SRT, VTT, raw text).
    - Research text splitting libraries (e.g., `langchain.text_splitter` vs custom regex).
- **Week 2: Semantic Chunking**
    - Develop regex/NLP-based section header detection (e.g., "## Chapter 3: Integrals").
    - Implement sliding window text splitting with 20% overlap.
- **Week 3: Long-Context Optimization**
    - Benchmark Gemini’s context window limits (e.g., max tokens per request).
    - Design fallback strategy for oversized transcripts (e.g., prioritize headers).
- **Week 4: Integration & Validation + Buffer**
    - Test full preprocessing pipeline on sample lectures (e.g., MIT OCW videos).
    - Validate chunk coherence by reconstructing split text.
    - Address any unexpected issues or refine implementation (Buffer).
*Deliverable*: Preprocessing module with 90%+ accuracy in section detection.

---

#### **Phase 2: Batch Prediction & Async Pipeline (Weeks 5–8)**
- **Week 5: Batching Strategy Design**
    - Study Gemini API rate limits (requests/minute and tokens/minute).
    - Design question clustering by topic (e.g., TF-IDF for grouping related queries).
- **Week 6: Async Implementation**
    - Build async batch processor using `asyncio` and `aiohttp`.
    - Handle API retries with exponential backoff (e.g., `tenacity` library).
- **Week 7: Batch Size Optimization**
    - Experiment with dynamic batch sizing based on token count.
    - Balance latency vs. cost (e.g., smaller batches for urgent queries).
- **Week 8: Integration & Stress Testing + Buffer**
    - Test with synthetic question sets (e.g., 100+ questions on a 2-hour lecture).
    - Measure throughput (questions/minute) and error rates.
    - Handle unexpected errors and optimize pipeline (Buffer).
*Deliverable*: Asynchronous batch processing pipeline capable of processing X questions/minute with Y% error rate. (Specify X and Y based on initial testing)

---

#### **Phase 3: Context Caching & QA Interlinking (Weeks 9–12)**
- **Week 9: Caching Architecture**
    - Implement in-memory LRU cache using `cachetools`.
    - Define cache keys (e.g., `hash(question + transcript_chunk)`).
    - Exploring the Use of Semantic Embeddings for Matching Question Similarity.
- **Week 10: Interconnected Questions**
    - Track conversation history via a `Session` object.
    - Auto-inject prior answers into follow-up questions (e.g., "Referring to Q3...").
    - Implement the idea of using embedding.
- **Week 11: Persistent Cache & Validation**
    - Develop cache invalidation for outdated transcript segments.
- **Week 12: Edge Cases & Final Integration + Buffer**
    - Handle subtitles/audio mismatches via self-correction prompts.
    - Merge preprocessing, batching, and caching into a unified CLI.
    - Edge case handling, improve response and handling logic. (Buffer).
*Deliverable*: Context caching system that reduces API calls by Z% for interconnected questions. (Specify Z based on initial testing)

---

#### **Phase 4: Validation, Docs , Finalization & Buffer (Weeks 13–14)**
- **Week 13: Output Formatting & Validation**
    - Generate JSON/CSV outputs with timestamps and confidence scores.
    - Add video timestamp validation (e.g., cross-check answer vs transcript timecodes).
    - *Deliverable*: User-friendly output module + validation report.
- **Week 14: Documentation & Community Prep**
    - Write API docs, usage examples, and a tutorial video.
    - Prepare test datasets and contribution guidelines for open-source release.
    - *Deliverable*: Final code release on GitHub + demo video.


---

## Why Me?
My competitive programming background ensures efficient algorithm design, while prior work with APIs and async Python aligns perfectly with the project’s technical demands. I’m deeply invested in AI agents and have a proven track record of delivering complex systems under time constraints.  

--- 

## More about Me
- **Name**: Kainian Zhu
- **Education**: BSc in Computer Science, Shanghai University of Electric Power  
- **Email**: fenglingyexing@gmail.com
- **Github**: [EmptyDust](https://github.com/EmptyDust/)
- **Time Zone**: UTC+08:00 (China)
- **Location**: Shanghai, China
- **Relevant Experience**:  
  - **Competitive Programming**: ICPC Regional Silver Medalist (2272 [Codeforces](https://codeforces.com/profile/Empty_Dust) maxrating).  
  - **API Integration**: Built a [Minecraft mod](https://github.com/EmptyDust/anti-addiction-2) using APIs with async workflows.  
  - **Agent**: As a Research Assistant at Tongji University and PolyU, I'm actively following the advancements in AI agents.