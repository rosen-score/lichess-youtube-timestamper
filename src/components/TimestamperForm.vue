<script lang="ts">
import { Game, game, games } from 'chess-fetcher'
import { defineComponent } from 'vue'
import { formatChapterName, formatTimestamp, renameOpeningStaffordGambit } from '../utils/format'

const defaultUsername = 'Fins'
const defaultFirstGameLink = 'https://lichess.org/r6LZ0lc0'

type Chapter = {
  timestamp: string
  title: string
}

export default defineComponent({
  data() {
    return {
      placeholderUsername: defaultUsername,
      placeholderFirstGameLink: defaultFirstGameLink,

      usernameInput: defaultUsername,
      firstGameLink: defaultFirstGameLink,

      games: [] as Game[],

      gamesStartAt: 30, // seconds into YouTube video when the first game starts
      options: {
        showOpeningName: true,
        showOpponentName: true,
        showOpponentRating: true,
        renameOpeningStafford: false,
      },
    }
  },

  computed: {
    username(): string {
      return this.usernameInput.toLowerCase().trim()
    },
    isUsingDefault(): boolean {
      return (
        this.username === this.placeholderUsername.toLowerCase() && this.firstGameLink === this.placeholderFirstGameLink
      )
    },
    hasGames(): boolean {
      return this.games.length > 0
    },
    firstGameTimestamp(): number {
      return this.hasGames ? this.games[0].timestamp : 0
    },
    chapters(): Chapter[] {
      if (!this.hasGames) {
        return []
      }

      let chapters = this.games.map((game): Chapter => {
        let title: string[] = []

        if (this.options.showOpeningName) {
          let chapterName = formatChapterName(game.opening.name)

          if (this.options.renameOpeningStafford) {
            chapterName = renameOpeningStaffordGambit(chapterName)
          }

          title.push(chapterName)
        }

        let opponentName: string
        let opponentRating: number | undefined
        if (this.username === game.players.white.username?.toLowerCase()) {
          opponentName = (game.players.black.title || '') + ' ' + game.players.black.username
          opponentRating = game.players.black.rating
        } else {
          opponentName = (game.players.white?.title || '') + ' ' + game.players.white?.username
          opponentRating = game.players.white?.rating
        }

        if (this.options.showOpponentName) {
          title.push('- vs ' + opponentName)
        }

        if (this.options.showOpponentRating) {
          title.push('(' + opponentRating + ')')
        }

        return {
          timestamp: this.convertSecondsToHhMmSs(this.gamesStartAt + (game.timestamp - this.firstGameTimestamp) / 1000),
          title: title.join(' '),
        }
      })

      if (this.gamesStartAt >= 10) {
        chapters.unshift({
          timestamp: formatTimestamp(new Date('2000-01-01T00:00:00Z')),
          title: 'Introduction',
        })
      }

      return chapters
    },
  },

  methods: {
    convertSecondsToHhMmSs(seconds: number): string {
      // YouTube chapters have to be at least 10 seconds long
      // so if the 1st game starts within the first 10 seconds of the video, just use "0:00"
      if (seconds < 10) {
        seconds = 0
      }
      let date = new Date('2000-01-01T00:00:00Z')
      date.setSeconds(seconds)

      return formatTimestamp(date)
    },
    onSubmit() {
      this.games = []
      game(this.firstGameLink).then((game) => {
        let timestampForFirstGame = game.timestamp
        games(
          `https://lichess.org/@/${this.username}`,
          (game) => {
            this.games.push(game)
          },
          {
            since: timestampForFirstGame,
            until: timestampForFirstGame + 24 * 60 * 60 * 1000, // get 24 hours worth of games
            sort: 'dateAsc',
            opening: true,
          }
        )
      })
    },
  },
})
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-start px-4 mx-auto py-6 bg-slate-100">
    <div class="space-y-4">
      <form class="space-y-4" @submit.prevent="onSubmit">
        <div class="space-y-2">
          <label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="name"
            >Lichess Username</label
          ><input
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="name"
            :placeholder="placeholderUsername"
            v-model="usernameInput"
            spellcheck="false"
          />
        </div>
        <div class="space-y-2">
          <label
            class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            for="email"
            >Link to the first game</label
          ><input
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="email"
            :placeholder="placeholderFirstGameLink"
            v-model="firstGameLink"
            spellcheck="false"
          />
        </div>

        <button
          type="submit"
          class="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Generate Chapters
        </button>

        <div class="grid gap-2 bg-slate-300 p-4" v-if="hasGames">
          <h3 class="font-semibold underline">Options</h3>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="options.showOpeningName" id="showOpeningName" />
            <label
              class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm"
              for="showOpeningName"
            >
              Include the opening name
            </label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="options.showOpponentName" id="showOpponentName" />
            <label
              class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm"
              for="showOpponentName"
            >
              Include the opponent's username
            </label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="options.showOpponentRating" id="showOpponentRating" />
            <label
              class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm"
              for="showOpponentRating"
            >
              Include the opponent's rating
            </label>
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="options.renameOpeningStafford" id="renameOpeningStafford" />
            <label
              class="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm"
              for="renameOpeningStafford"
            >
              Rename all "Russian Game: Stafford Gambit" to "STAFFORD GAMBIT"
            </label>
          </div>
          <div class="space-y-2">
            <label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              for="gamesStartAt"
            >
              First game starts at (seconds into video):
            </label>
            <input
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              id="gamesStartAt"
              v-model.number="gamesStartAt"
              type="number"
              min="0"
            />
          </div>
        </div>
      </form>
    </div>
    <div class="space-y-4">
      <div class="bg-slate-200 m-4 p-4 text-center" v-if="isUsingDefault">
        <p class="mb-2">Use the prefilled examples to see the chapters for this "Lichess Plays" video:</p>
        <iframe
          class="rounded-xl w-full aspect-video"
          src="https://www.youtube-nocookie.com/embed/Aw3zcG_efuI?si=-NESinQ2dy7kIgHk"
          title="YouTube video player"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
        ></iframe>
      </div>
      <p class="text-gray-500 dark:text-gray-400"></p>
    </div>
  </div>

  <div class="bg-yellow-100 p-4" v-if="hasGames">
    <h3 class="font-semibold">Copy &amp; paste this to the video description</h3>
    <p>
      YouTube will automatically add chapter markers and link the timestamps once this content is in the description
    </p>
    <div class="py-4 px-2 text-sm">
      <div v-for="chapter in chapters">
        {{ (chapter as Chapter).timestamp }}
        {{ (chapter as Chapter).title }}
      </div>
    </div>
  </div>
</template>
