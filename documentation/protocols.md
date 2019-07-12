# Cloud Prototyping

All meeting protocols are listed below ordered by date (descending).

### 07/09/19, 12-4pm: Team meeting and final presentation

**Done:**

- Final preparation for live demo and presentation
  - first preparation in Team meeting on 07/08/19
- Presentation of privacy aware system
- Discussion and feedback on presentation
  - Signing of meter data
    - Hash and sign sensor data in the smart meter
    - Verify signature in dUtility contract
  - Benchmarks
  - Host of NED-Server = trusted entity (e.g. utility)
  - Motivation
    - Transformation of the current analog model into a digital model
  
**ToDo:**

- Benchmarks
  - Scalability
  - Gas costs
  - Durations
  - Latency
  - Hardware requirements
  - Availability
- Documentation/ Report
  - Structure: scientific paper
    1. Abstract (optional: results)
    2. Introduction 
    3. Background and related work
        - No standard tooling (e.g. Node.js), explain not-standard tooling (e.g. ZoKrates, Ethereum PoA)
        - Related work: focus on privacy in blockchain
    4. Main part
        - Requirements
        - Design phase, architecture
        - 2 phases (components)
        - Flows, Sequence diagrams
        - Setup guide (maybe refer to GitHub)
    5. Evaluation 
        - Benchmarks
        - Trust assumptions
    6. Projectmanagement/-organization
        - Our take away (what works, whats didn't work, meeting frequency)
        - Not focused on technologies
    7. Conclusion
    8. Appendix
        - Logs
        - Protocols
  - Include authors and reviewers of each section (on extra sheet)
  - Logs and protocols in appendix
  - ~50-100 pages 
    
**Remark:**

- GitHub
  - Clean up repository
  - 2 repositories or 2 branches for the 2 Milestones
- One feedback round 
- Next meetings
  - Team meeting 07/16/19 12pm
  - 15min. individual feedback slots with Jacob: End of September


### 07/02/19, 12-3pm: Team meeting and meeting with Jacob

with Jacob from 2pm

You can find the agenda [here](https://docs.google.com/document/d/1XQ4bXn_yHIRhfa8-JAqrDXvk7lP3wkP-XHCPbtvk4vA/edit#).

**Done:**

- Emo round
- Updates on the different components
  - NED Server
  - ZoKrates
    - New constraint: either consuming households or producing household are satisfied (energy = 0; +- error tolerance)
  - dUtility contract
  - HPU
- Discussion on data consistency
  - HPU - meter reading (produce/consume for UI)
  - NED - meter reading
  - dUtility - meter reading, computes energy delta itself
  - ZoKrates - energy delta (netting), meter reading (hash)
  - Mock Sensor - sends meter reading, produce/consume (for HHS)
- Hashing approach
  - Analogical to ZoKrates pre-image tutorial
  - Concatenating first
  - Compliance through padding
    - 2 field elements (will be unpacked) each encoding 128 bit
    - Remember padding to ensure correct computation
  - No ZoKrates on HPU (too much overhead) but use the same hashing approach

**ToDo:**

- HPU
  - Send hashed data to dUtility
  - Send data to NED
- NED
  - Send proof to dUtility
- ZoKrates
  - Add new constraint
  - Compute hash
- dUtility
  - Check hashes
  - Throw events dependent on success of comparison
- Integration of components
- Connection of Docker images   
    
**Remark:**

- What if netting fails?
  - No status update
  - Therefore, just waiting for next successful netting   
- NED: Default meter value if HPU does not send = last meter value 
- Next meetings
  - Team meeting 07/08/19 3pm
  - Team meeting 07/09/19 12-2pm
  - Final presentation 07/09/19 2-4pm

### 06/26/19, 12-2pm: Team meeting and meeting with Jacob

with Jacob from 1-2pm

You can find the agenda [here](https://docs.google.com/document/d/1b45EfrC5g6ao5BvzjNiTZcvzyas-LA37cQf5mBW1xQ0/edit#).

**Done:**

- Emo round
- Updates on the different components
  - NED Server
  - ZoKrates
  - dUtility contract
  - HPU
- Discussion on current architecture
  - HPU 
    - Send plain values to NED
    - Put hashed values on the blockchain
  - NED
    - Execute netting 
    - Does not hash values
  - ZoKrates
    - Plain meter values from NED as private input
    - ZoKrates hashes meter values
    - Hash as public output (can be treated as public input by the dUtility contract)
  - Check if hash value on-chain is the same as the one from ZoKrates 

**ToDo:**

- NED
  - Send proof to dUtility contract
  - EventListener for Verification Contract
  - Docker-setup
- ZoKrates
  - Revise constraints (invariants stronger if possible)
  - Hash private input
- dUtility contract
  - Check correctness of hashes
- HPU 
  - Write hashed meter values to blockchain
  - Listening to events
    - HPU is only allowed to send transaction if verification event received
  - Collect deeds from NED (and writes into DB)
    
**Remark:**

- Short follow-up meeting with Jacob on 06/28/19 2pm regarding current architecture
- Case of wrong netting/no netting
  - Proof invalid = should not occur, as ZoKrates does not generate invalid proofs
  - Do the netting later (netting is done after consumption either way)
- Hash computation
  - Example in ZoKrates (proof of pre-image)
  - Sha uses different number of rounds, could lead to different hashes with similar input
- Trust NED only with data privacy, not with correct netting 
- Final presentation (07/09/19 2-4pm)
  - 20-30 min. 
  - Slides English, Language German is ok
  - Content
    - Motivation (specific)
    - Recap: Milestone presentation
    - How privacy is introduced
  - Demo
    - UI (with meter data)
    - Blockchain (no clear data, only hashes)
    - Show that netting works    
- Next meetings
  - Team meeting 07/02/19 12-2pm
  - Meeting with Jacob 07/02/19 2-4pm

### 06/18/19, 12-2pm: Team meeting

You can find the agenda [here](https://docs.google.com/document/d/15s6lRSq7oatCTWKJ3v5tNRI-DcVb6m5ThTweFFfA-_g/edit#).

**Done:**

- Emo round
  - start working on the final presentation as soon as possible
  - split work on dUC
- Updates and discussion on architecture
  - ZoKrates Netting approaches
    - (1) naive approach: NED result of netting = ZK result of netting?
    - (2) threshold approach: 10% min
    - (3) weak fairness: + stay or send / - stay or receive
  - NED Server
    - Verification via check with VS
    - utility.js includes deeds that can be collected by the HPUs
  - UI connected to NED instead of HPU 
  - HPU needs adjustments 
- Structure ToDos and priorities

**ToDo:**

- HPU
  - Communication to NED
  - Adapt deeds collection (from NED)
- NED
  - execute Netting alorithm and generate proof
  - Sript for ZoKrates Deployment flow
  - Listen to events of dUtility contract
  - Verify signed data from HPU
- dUtility
  - Verify execution of settlement
  - Fire events
  - Send hash to NED
- ZoKrates
  - Implement weak fairness
  - Check for correct and fair settlement
- Adjust parity related files
    
**Remark:**

- High priority
  - NED Server
  - ZoKrates
- Lower priority for following week 
  - Verification contract
  - ZoKrates deployment flow
- Thoughts on SMPC
  - Up to now: no approach easy feasible
  - What it would change
    - No need for utility.js in NED
    - ZK in NEd would be split up towards the HPU
- Next meetings
  - 06/26/19 2-4pm (Wednesday) with Jacob
  - 06/26/19 12-2pm Team meeting

### 06/11/19, 12-4pm: Team meeting and presentation of approaches on privacy

with Jacob from 2-4pm

You can find the agenda [here](https://docs.google.com/document/d/1VMTaAn8DHaaM1hqrleETW7YyGQHyhlrCRExV8kV3sII/edit#).

**Done:**

- Emo round
- Updates on components and deployment
- Discussion on different approaches on privacy using ZoKrates
- Presentation of approaches to Jacob
   - See presentation [here](https://docs.google.com/presentation/d/1zOiGrjStRZrnLnRzxdYRP923lzhBULIKj5guFEK3EoQ/edit#)
   - Use approach 1 (introducing a Netting entity) first, later maybe shift more towards approach 2

**ToDo:**

- Set up netting entity
- Adjust dUtility contract
  - Includes Netting algorithm into ZoKrates
- Update Docker setup
- Research Secure Multi-Party Computation
    
**Remark:**

- Next meeting with Jacob
  - 06/26/2019 or 07/02/2019
- Next Team Meeting
  - 06/18/2019
- idea: Secure Multi-Party Computation
  - Protocols allowing calculation including several parties without revealing the given data from each party
  - Efficiency?
- Use smart meter value, not produce & consume values
- JavaScript Wrapper for ZoKrates
  - Nightfall (EY)


### 06/04/19, 12-4pm: Team meeting and Introduction to ZoKrates

with Jacob from 2-4pm

You can find the agenda [here](https://docs.google.com/document/d/1DgWPveFH9KuTakMvF7ReNY_Ei5GiwH7Z-UjZffhgMx8/edit#).

**Done:**

- Emo round
  - Priority now: Privacy
- Presented current state of the different components
- Sharing Knowledge on Zero-Knowledge Proofs
- Short follow-up from Midterm presentation
- Introduction to ZoKrates by Jacob

**ToDo:**

- Integration of VS and UC
- Make GitHub repository private and invite responsible people
- Fix values from Mock Sensor
- Get started with ZoKrates
  - Set up invariants
  - What should be off-chained?
- No meter data on the Blockchain using Jacobs approach (after agreeing on a model for using ZoKrates)
  - Hash produce/ consume values and put them on the Blockchain
  - Hash as public input, produce/ consume as private input to ZoKrates
  - Prove that Hash and produce/ consume values match
  - Keep in mind: maybe later meter value instead of produce/ consume values
    
**Remark:**

- Next meetings with Jacob
  - 06/11/2019 2pm 
  - 06/25/2019 2pm
- ZoKrates
  - Use the example and stdlib folder on GitHub as help
  - Use the Optimizer
  - Standard operations are all possible
- Meter values should not be changed within the Contracts


### 05/28/19, 12-4pm: Team meeting and Midterm presentation

Midterm presentation from 2-4pm

You can find the agenda [here](https://docs.google.com/document/d/10DUs-q4Ll7EPuuEPqt41bd3saX75i_DbgcTOUUF4xYQ/edit#).

**Done:**

- Emo round
  - Define responsibilities clearer
  - Consensus on review process
    - Test functionality
    - Look at code
    - Quick fixes for deadline: functionality tests sufficient
- Finalize presentation and demo
- Midterm presentation
  - Why Blockchain?
    - Trustlessness: households only need to trust themselves and their component at home (which is validated by TÜV/ Eichamt)
    - Evolution of todays system
    - Also: no one can cheat the system (immutability)
  - Security
    - Given through signing of data and transactions 
    - Household processing unit is an enclosed system
    - HHS only forwards the sensor data

**ToDo:**

- Update architecture
- Integration of VS and UC
- Make GitHub repository private and invite responsible people
- Component signing sensor data
  - should also sign transactions and signature should be verified
- Benchmarks
  - HW requirements: Would a RaspberryPi suffice?
    (other apporach: use HW-constraint and make network as high throughput as possible)
  - Measurements
    - Processing time vs. gas consumption
    - Memory consumption
    - Conditions: time, platform to run the system
  - Ratio prosumer vs. consumer: introduce variable
  - Gas cost for updating contracts
- Research literature for netting algorithms
- Handling of updates to contract
  - Majority based
  - Code in smart contract allows updates and majority approves
- Failure handling (esp. HPU)
- 2 UIs 
  - One for producer/ prosumer
  - One for consumer
  

**Remark:**

- Introduction to ZoKrates with Jacob on 06/04/2019 2pm
- New information on setup
  - sensor-data every 15 min. (therefore netting also every 15 min.)
  - sensor gives data comparable to energy meters nowadays
    - one number increasing with consumption and decreasing with production of energy
    - rather push this number to blockchain? 
    - could be helpful in case of failure of HPU (rebuilding + restoring data)
- Where does the Utility get their data from?
    - Option 1: separate channel to provide data to utility
    - Option 2: utility goes through infrastructure to get all data
    - Option 3: ?

### 05/21/19, 12-4pm: Team meeting and presentation of prototype to Jacob

with Jacob from 2-4pm

You can find the agenda [here](https://docs.google.com/document/d/1mzuIg_V27iKG_0W1YkTX4yXUFj7ehvbZZdBTr2EM-Ww/edit#).

**Done:**

- Emo round
  - Improve communication (via Slack, especially on problems)
  - When someone has free capacity: write in Slack
  - Clear prioritization of issues (together)
- Presented current state of the different components and integration

**ToDo:**

- HHS
  - Collect deeds
  - `findLatestBlock` in DB (find and eliminate possible inconsistencies)
- UC
  - Benchmarking of gas costs and scalability
  - Integration with VS
- AN
  - Move from docker to Parity
- UI
  - Include data from blockchain
  - Rename categories ('network stats', 'deeds ticker')
- Mock Sensor
  - Include flag for focus on consume/ produce
  - More realistic data
- Update architecture
- Prepare Midterm presentation
  - Add new slide set
  - research privacy in blockchain

**Remark:**

- Midterm presentation Tue 05/28/19, 2-4pm with complete prototype
- Info on Smart Meter
  - Generally as assumed
  - Smart meter contains only the sensors and limited computational power, household processing unit is separate
  - Sensor data should be signed by smart meter component
  - Key management: node.js component either belonging to the ethereum client or key management separate from blockchain (less complex)
- Info on Midterm presentation
  - 20 - max. 30 min
  - Content
    - Goal of project
    - What have we achieved until now?
    - What do we still have to achieve and how?
  - By default: same amount of portfolio points for every team member

### 05/14/19, 12-4pm: Team meeting

You can find the agenda [here](https://docs.google.com/document/d/1OA26rjkMOh78uuaZQKDz5ICljEee16qwS9beG49Gu3w/edit).

**Done:**

- Emo round
  - Reminder for work-log
  - Integration issues (long-term integration)
- Code walkthrough: AN, UC and HHS

**ToDo:**

- HHS
  - Event-based system to promise-based system
  - `GET` request returns DB data
  - `PUT` sends transaction and stores `deeds` in DB
- UC
  - Adjust `Ownable` contract to match with AN
  - Refactor names and migration
  - Rounding bug
  - Improve settlement (high gas costs, for-loops), off-chain solution
- AN
  - Finally finish `ValidatorSet` contract to finish integration
  - Deploy all contracts within genesis block
  - Fix `Ownable` contract issues
- UI
  - Create simple SPA UI with React
  - Mock UI is [here](https://cloudprototypingss19.slack.com/files/UHXH0AHHB/FJNUQE8P2/img_20190514_142501.jpg)
- Still need to finalize integration
  - Validator contracts and parity
  - Utility contracts and parity
  - Utility contracts and BlockReward
  - HHS and Parity
- Update wiki
- Work-log is important

**Remark:**

- Meeting Tue 05/21/19, 2-4pm with Jacob working version with basic UI.

### 05/07/19, 12-4pm: Team meeting and presentation of first prototype to Jacob

with Jacob from 2-4pm

You can find the agenda [here](https://docs.google.com/document/d/1Oqtdeed5grp_tB9J7Luk1VeumOAo7gQatSjYGj69og8/edit).

**Done:**

- Emo round
  - Milestone not reached yet
  - Merge pull-request right away if it pass review
- Presented current state of the different components: AN, UC and HHS

**ToDo:**

- HHS
  - Use express in order to serve UI as well
  - Generate timestampes within DB
  - Focus on integration tests
- UC
  - Split amount of energy in produced and consumed
  - Refactor deeds: from, to, isRenewable (split into amounts)
  - `retrieveReward` delete or mark as deprecated
  - Improve settlement (high gas costs, for-loops), off-chain solution?
- AN
  - Research on the block reward contract: seems odd that no events can be emitted
  - List dependencies of the network
- UI
  - Create mock UI
  - Maybe cache data from blockchain in DB (query latency)
- Finalize integration
  - Validator contracts and parity
  - Utility contracts and parity
  - Utility contracts and BlockReward
  - HHS and Parity
- Update wiki, architecture and workflow diagram
- Integrate JSDoc
- Write individiual diary: What was done?

**Remark:**

- Meeting Tue 05/21/19, 2-4pm with Jacob working version with basic UI.

### 04/30/19, 2-4pm: Discussion issues and current project state

You can find the agenda [here](https://docs.google.com/document/d/1_zDR3dSCwFIMgv8dH5l74DF5PgwC4Q7JSA9S_kl52mo/edit).

**Done:**

- Emo round: start pull-request on a frequent base
- HHS
  - Interaction HHS UC: aggregated consumed/produced energy data send to contract
  - Discussion about sending saw consumed/produced energy data per sensor to contract
  - Discarded sending JSON objects to UC
  - Native HTTP server for now, maybe refactor as express server later
- UC
  - Mapping 1:1, address household/parity node to energy tracking data
  - Internal household mapping, refactor if ValidatorSet is ready
  - Netting causes looping over existing households, keep gas costs low
- AN
  - Trigger for netting is a tradeoff
    1. Periodic call by BlockReward contract, no events can be emitted
    2. BlockReward calls Scheduler who calls netting in UC
- Wiki rules and conventions
- Discussion on milestones

**ToDo:**

- Refactor and implement discussed issues regarding HHS, UC and AN
- Define milestones in GitHub repository

**Remark:**

- Is it possible to share the address of the smartmeter with the AN and HHS?
- Should we map sensor' addresses to consumption and production in UC?
- Issue with BlockReward as a trigger for netting.
- Meeting Tue 05/07/19, 2-4pm with Jacob and first prototype.

### 04/23/19, 12-5pm: Team meeting and presentation to Jacob

with Jacob from 2-4pm

**Done:**

- Define workflow, devflow, devtools
- Define and fokus on architecture and user/component stories
- Discussion on architecture: protected private key, ERC-20, Netting algorithm and trigger, PoA
- Discussion on projectmanagement: tasks, priority, issues, deadlines
  - Policy: only discuss GitHub issues in meetings
- Discussion on devtools: docker, build scripts

**ToDo:**

- Information about smartmeter
- Milestones and concret tasks
- First prototype

**Remark:**

- Milestones for the next two weeks
- Next meeting Tue 04/30/19, 2-4pm without Jacob
- Meeting Tue 05/07/19, 2-4pm with Jacob and first prototype

### 04/16/19, 2-4pm: Team kick-off meeting and getting started

with Jacob

**Done:**

- Short recap of motivation and use cases for decentralized energy trading
- Discussion about privacy issues and short introduction to [ZoKrates](https://github.com/Zokrates/ZoKrates)
- Get to gether/ to know

**ToDo:**

- Election projectmanager
- Public GitHub repo, Slack, Trello
- Workflow, devflow/-tools, achritecture

**Remark:**

- Qispos registration
- Next meeting Tue 04/23/19, 12-4pm
