BEGIN TRANSACTION;
DROP TABLE IF EXISTS "channel";
CREATE TABLE IF NOT EXISTS "channel" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"name"	TEXT NOT NULL,
	"song_id"	INTEGER,
	"volume"	INTEGER DEFAULT 0,
	"pan"	INTEGER DEFAULT 0,
	"transpose"	INTEGER DEFAULT 0,
	"disabled"	INTEGER DEFAULT 0,
	"sample_id"	INTEGER,
	"position"	INTEGER DEFAULT 1
);
DROP TABLE IF EXISTS "user";
CREATE TABLE IF NOT EXISTS "user" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"username"	TEXT UNIQUE,
	"password"	TEXT,
	"email"	TEXT UNIQUE,
	"pyKey"	TEXT UNIQUE
);
DROP TABLE IF EXISTS "stepSequence";
CREATE TABLE IF NOT EXISTS "stepSequence" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"steps"	BLOB NOT NULL,
	"pattern_id"	INTEGER,
	"channel_id"	INTEGER
);
DROP TABLE IF EXISTS "pattern";
CREATE TABLE IF NOT EXISTS "pattern" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"song_id"	INTEGER,
	"bars"	INTEGER CHECK(4),
	"position"	INTEGER CHECK(1),
	"name"	TEXT
);
DROP TABLE IF EXISTS "song";
CREATE TABLE IF NOT EXISTS "song" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"title"	TEXT NOT NULL DEFAULT 'Untitled',
	"user_id"	INTEGER,
	"bpm"	INTEGER NOT NULL DEFAULT 120,
	"swing"	NUMERIC DEFAULT 0.0
);
DROP TABLE IF EXISTS "filterSection";
CREATE TABLE IF NOT EXISTS "filterSection" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"position"	INTEGER DEFAULT 1,
	"channel_id"	INTEGER,
	"on"	INTEGER DEFAULT 0,
	"type"	TEXT DEFAULT 'lp',
	"frequency"	INTEGER DEFAULT 22000
);
DROP TABLE IF EXISTS "sample";
CREATE TABLE IF NOT EXISTS "sample" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"filename"	TEXT,
	"reverse"	INTEGER DEFAULT 0,
	"trim"	INTEGER DEFAULT 0,
	"normalize"	INTEGER DEFAULT 0
);
DROP INDEX IF EXISTS "songChannelPosition";
CREATE UNIQUE INDEX IF NOT EXISTS "songChannelPosition" ON "channel" (
	"song_id",
	"position"
);
DROP INDEX IF EXISTS "songChannelName";
CREATE UNIQUE INDEX IF NOT EXISTS "songChannelName" ON "channel" (
	"name",
	"song_id"
);
DROP INDEX IF EXISTS "songPatternPosition";
CREATE UNIQUE INDEX IF NOT EXISTS "songPatternPosition" ON "pattern" (
	"song_id",
	"position"
);
DROP INDEX IF EXISTS "patternChannelSteps";
CREATE UNIQUE INDEX IF NOT EXISTS "patternChannelSteps" ON "stepSequence" (
	"pattern_id",
	"channel_id"
);
DROP INDEX IF EXISTS "channelFilterPosition";
CREATE UNIQUE INDEX IF NOT EXISTS "channelFilterPosition" ON "filterSection" (
	"position",
	"channel_id"
);
DROP INDEX IF EXISTS "sampleFileSettings";
CREATE UNIQUE INDEX IF NOT EXISTS "sampleFileSettings" ON "sample" (
	"filename",
	"reverse",
	"trim",
	"normalize"
);
DROP INDEX IF EXISTS "songUserTitle";
CREATE UNIQUE INDEX IF NOT EXISTS "songUserTitle" ON "song" (
	"user_id",
	"title"
);
COMMIT;
