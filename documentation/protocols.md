# Cloud Prototyping

All meeting protocols are listed below ordered by date (descending).

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
- Benchmarks
  - HW requirements: Would a RaspberryPi suffice?
    (other apporach: use HW-constraint and make network as high throughput as possible)
  - Measurements
    - Processing time vs. gas consumption
    - Memory consumption
    - Conditions: time, platform to run the system
  - Ratio prosumer vs. consumer: introduce variable
  - Prices for updating contracts
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
