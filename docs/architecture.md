# System Architecture

The RS3 Progression Intelligence System transforms RuneScape game data
into actionable gameplay recommendations.

## Architecture Layers

External APIs
?
Connector Layer
?
Normalization Layer
?
Cache Layer
?
Decision Engine
?
Frontend Dashboard

## Backend Responsibilities

- connect to external APIs
- normalize data
- cache responses
- evaluate progression logic
- expose stable endpoints

Example endpoints:

GET /runemetrics/:username
GET /quests/:username
GET /ge/:itemIds
GET /vos
GET /merchant
