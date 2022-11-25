import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { GmAnchor } from "../target/types/gm_anchor";
import { assert } from "chai";

describe("gm-anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();

  const program = anchor.workspace.GmAnchor as Program<GmAnchor>;
  const gmAccount = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  it("Airdrops to user for payer", async () => {
    const airdropSellerSig = await provider.connection.requestAirdrop(
      user.publicKey,
      2e9
    );
    const latestSellerBlockhash =
      await provider.connection.getLatestBlockhash();

    await provider.connection.confirmTransaction({
      blockhash: latestSellerBlockhash.blockhash,
      lastValidBlockHeight: latestSellerBlockhash.lastValidBlockHeight,
      signature: airdropSellerSig,
    });
  });

  it("Writes to gmAccount", async () => {
    let inputName = "Glass Chewer";
    const tx = await program.methods
      .execute(inputName)
      .accounts({
        gmAccount: gmAccount.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([gmAccount, user])
      .rpc();

    const storedGmAccount = await program.account.greetingAccount.fetch(
      gmAccount.publicKey
    );
    const storedName = storedGmAccount.name;
    console.log("Stored GM Name Is:", storedName);
    assert.equal(storedName, inputName);
  });
});
