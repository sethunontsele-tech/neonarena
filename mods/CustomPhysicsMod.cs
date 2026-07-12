using System;
using UnityEngine;

namespace NeonArena.Mods 
{
    // C# OpenXR Kinetic Controller Mod
    public class CustomPhysicsMod : MonoBehaviour 
    {
        public const float SPEED_MULTIPLIER = 2.5f;
        public const float GRAVITY_MULTIPLIER = 0.5f;
        public const string MOD_ID = "com.neon.kinetic_override";

        void Start() 
        {
            Debug.Log("[Neon Arena ModLoader] Custom Physics Mod loaded successfully.");
        }
    }
}
