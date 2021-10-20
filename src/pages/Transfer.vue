<template>
  <q-page class="column justify-center items-center">
    <h2>Telos Lottery (testnet)</h2>
    <h2>CURRENT POOL: {{ pool }}</h2>
    <h3>TIME REMAINING: {{ countDown }}</h3>
    <h3>{{ winnerString }}</h3>
    <q-btn v-if="showRevealButton" label="Click To Reveal Winner!" color="primary" class="reveal-button" @click='endLottery'></q-btn>
    <div v-if="isAuthenticated">
      <q-input
        outlined
        bottom-slots
        suffix="TLOS"
        v-model="amount"
        label="Amount"
        step='1'
        counter
        type="number"
        maxlength="12"
      >
      </q-input>
      <q-btn size="xl" round dense flat icon="send" @click="send" />
      <q-dialog v-model="showTransaction" confirm>
        <q-card >
          <q-card-section class="row">
            <q-avatar icon="arrow_forward" color="primary" text-color="white" />
            <span class="q-ml-sm">
              Transaction sent, click to view in block explorer.
            </span>
            <q-item
              clickable
              tag="a"
              target="_blank"
              :href="`${explorerUrl}/transaction/${transaction}`"
              class="q-ml-sm"
              >{{ transaction }}</q-item
            >
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Ok" color="primary" v-close-popup></q-btn>
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
    <div v-else>Please login to enter!</div>
  </q-page>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      to: "tester555555",
      amount: null,
      memo: "lottery",
      showTransaction: null,
      transaction: null,
      explorerUrl: process.env.NETWORK_EXPLORER,
      timeLeft: "",
      winnerString:"",
      showRevealButton: false
    };
  },
  mounted() {
    let endTime = this.getTimeRemaining();
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "pool", "time"]),
    countDown(){
      return this.timeLeft;
    }
  },
  methods: {
    ...mapActions("account", ["accountExists", "getLotteryPool", "get"]),
    async send() {
      if (!(await this.accountExists(this.to))) {
        this.$q.notify({
          type: "negative",
          message: `Account ${this.to} does not exist`
        });
        return;
      }

      const actions = [
        {
          account: "eosio.token",
          name: "transfer",
          data: {
            from: this.accountName.toLowerCase(),
            to: this.to,
            quantity: `${parseFloat(this.amount).toFixed(4)} TLOS`,
            memo: this.memo
          }
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      }
      await this.getLotteryPool();
    },

    async getTimeRemaining() {
      try {
        const lotteryFunds = await this.$store.$api.getTableRows({
          code: "tester555555",
          scope: "tester555555",
          table: "lotteries"
        });
        const time = lotteryFunds.rows[0].end_lottery;
        let timeLeft = time - (Date.now() / 1000);
        if (timeLeft < 0){
          timeLeft = 0;
        }
        this.startTimer(timeLeft);
      } catch(e) {
        console.error(e);
    
      }
    },
    startTimer(duration) {
      let timer = duration, minutes, seconds;
      setInterval(() => {
        minutes = parseInt(timer / 60, 10)
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        this.timeLeft = `${minutes}:${seconds}`;

        if (this.timeLeft === '00:00'){
          this.showRevealButton = true;
        }

        if (--timer < 0) {
            timer = 0;
            return;
        }
      }, 1000);
    },
    async endLottery(){
      this.showRevealButton = false;
      debugger;
      const actions = [
        {
          account: "tester555555",
          name: "endlotto",
          data: {}
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
      debugger;
      if (transaction) {
        this.showTransaction = true;
        this.transaction = transaction.transactionId;
      };
      this.showRevealButton = false;
      this.getTimeRemaining();
    }
  }
}
</script>
<style scoped>
.reveal-button{

margin-bottom:2rem;

}



</style>
