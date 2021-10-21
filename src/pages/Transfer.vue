<template>
  <q-page class="column justify-center items-center">
    <h2>Telos Lottery (testnet)</h2>
    <h2>CURRENT POOL: {{ pool }}</h2>
    <h3>TIME REMAINING: {{ timeLeft }}</h3>
   
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
      <q-btn size="xl" round dense flat icon="send" @click="send" />

      </q-input>
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
    <q-btn class='link'><a style="text-decoration: none;" href="https://telos-test.bloks.io/account/tester555555">VIEW CONTRACT TRANSACTIONS</a></q-btn> 
    <q-btn label="Start Another Lottery  " color="primary" class="reveal-button" @click='endLottery' :disable='!isAuthenticated || !showRevealButton'></q-btn> 
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
    this.getTimeRemaining();
    this.getLotteryPool();
  },
  computed: {
    ...mapGetters("account", ["isAuthenticated", "accountName", "pool"]),
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
        let timeLeft = Number.parseFloat(time - (Date.now() / 1000)).toFixed(0);

        if (timeLeft <= 0 && this.isAuthenticated){
          this.showRevealButton = true;
          this.timeLeft = "00:00";
          this.getLotteryPool();
          return;
        }
        this.countdown(timeLeft);
      } catch(e) {
        console.error(e);
      }
    },
    countdown(seconds) {
      let counter = seconds;
      const interval = setInterval(() => {

        let minutes = Math.floor(counter / 60);
        let seconds = counter % 60;

        let tempMin = minutes < 10 ? `0${minutes}`: `${minutes}`;
        let tempSec = seconds < 10 ? `0${seconds}`: `${seconds}`;

        this.timeLeft = `${tempMin}:${tempSec}`;
        counter--;
      
        if (counter < 0 ) {
          clearInterval(interval);
          this.showRevealButton = true;
        }
      }, 1000);
    },
    async endLottery(){
      this.showRevealButton = false;
      const actions = [
        {
          account: "tester555555",
          name: "endlotto",
          data: {}
        }
      ];
      const transaction = await this.$store.$api.signTransaction(actions);
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
   margin-top:1rem !important;
}
@media only screen and (max-width: 576px) {
  h2, h3 {
    font-weight: 600;
    font-size: 1.5rem;
  }
}
</style>
